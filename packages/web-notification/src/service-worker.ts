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
  const readyClients = new Set<string>();

  sw.addEventListener('message', (event) => {
    if (event.source && 'id' in event.source) {
      readyClients.add(event.source.id);
    }
  });

  const waitForClient = (id: string) => {
    if (readyClients.has(id)) {
      return Promise.resolve(true);
    }

    return new Promise<boolean>((resolve) => {
      const timer = sw.setTimeout(() => {
        resolve(false);
        sw.removeEventListener('message', handler);
      }, 5000);

      const handler = (event: ExtendableMessageEvent) => {
        if (event.source && 'id' in event.source && event.source.id === id) {
          sw.removeEventListener('message', handler);
          sw.clearTimeout(timer);
          resolve(true);
        }
      };

      sw.addEventListener('message', handler);
    });
  };

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

    if (!isIOS()) {
      await sw.clients.openWindow(link);
      return;
    }

    const clientList = (await sw.clients.matchAll({})) as WindowClient[];
    let client = clientList.shift();
    if (!client) {
      await log('create client');
      client = (await sw.clients.openWindow('/ios-pwa')) ?? undefined;
    }

    if (client) {
      await client.focus();
      const ready = await waitForClient(client.id);
      await log({ ready });
      if (ready) {
        client.postMessage({ type: 'open', link });
      } else {
        await client.navigate(link);
      }
    } else {
      await log('no client');
    }
  };

  sw.addEventListener('notificationclick', (event) => {
    event.waitUntil(onNotificationClick(event));
  });
}
