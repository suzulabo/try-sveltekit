/// <reference lib="webworker" />

import { getMessaging } from 'firebase/messaging/sw';
import { getFirebaseApp } from './lib/notification/firebase';

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('install', (event) => {
  event.waitUntil(sw.skipWaiting());
});
sw.addEventListener('activate', (event) => {
  event.waitUntil(sw.clients.claim());
});

const log = async (data: unknown) => {
  const res = await sw.fetch(`/api/log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ua: sw.navigator.userAgent, log: data }),
  });

  if (!res.ok) {
    throw new Error('Post Log Error');
  }
};

const isIOS = () => {
  return /iphone|ipad|ipod/i.test(sw.navigator.userAgent);
};

const fcmDefault = false;

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (fcmDefault) {
  const firebaseApp = getFirebaseApp();
  getMessaging(firebaseApp);
} else {
  // https://github.com/firebase/firebase-js-sdk/blob/23069208726dc1924011eb84c8bf34d6f914a3a9/packages/messaging/src/listeners/sw-listeners.ts
  sw.addEventListener('push', (event) => {
    event.waitUntil(
      (async () => {
        await log('push event');

        if (!event.data) {
          return;
        }
        const payload = event.data.json();

        await log({ 'push payload': payload });

        const notification = payload.notification;

        await sw.registration.showNotification(notification.title, {
          ...notification,
          data: { link: notification.click_action },
        });
      })(),
    );
  });

  const onNotificationClick = async (event: NotificationEvent) => {
    await log('notificationclick event');
    event.stopImmediatePropagation();
    event.notification.close();

    const payload = event.notification.data;
    await log({ payload });
    const link = payload?.link;
    if (!link) {
      await log('no link');
      return;
    }

    const url = new URL(link, sw.location.href);

    const clientList = (await sw.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    })) as WindowClient[];
    await log({ clientList: clientList.length });

    const client = clientList.find((c) => {
      const clientUrl = new URL(c.url, sw.location.href);
      return clientUrl.host === url.host;
    });

    await log({ 'found client': !!client });

    if (client) {
      await client.navigate(url);
      // client.postMessage({ type: 'open', url: url.href });
    } else {
      if (!isIOS()) {
        await sw.clients.openWindow(url);
      } else {
        await log('iOS');
        const c = await sw.clients.openWindow('/');
        if (c) {
          c.postMessage({ type: 'open', url: url.href });
        }
      }
    }
  };

  sw.addEventListener('notificationclick', (event) => {
    event.waitUntil(onNotificationClick(event));
  });
}
