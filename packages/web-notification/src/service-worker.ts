/// <reference lib="webworker" />

import { PUBLIC_SENTRY_DSN } from '$env/static/public';
import * as Sentry from '@sentry/browser';

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('install', (event) => {
  event.waitUntil(sw.skipWaiting());
});
sw.addEventListener('activate', (event) => {
  event.waitUntil(sw.clients.claim());
});

console.log({ PUBLIC_SENTRY_DSN });

if (PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: PUBLIC_SENTRY_DSN,
    // Enable logs to be sent to Sentry
    _experiments: { enableLogs: true },
  });
}

const log = async (data: unknown) => {
  if (PUBLIC_SENTRY_DSN) {
    console.log('send sentry');
    Sentry.logger.info(JSON.stringify(data));
  }

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

const getClient = async () => {
  const clients = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clients) {
    try {
      await client.focus();
      return client;
    } catch (err) {
      await log({ 'focus error': err instanceof Error ? err.message : new String(err) });
    }
  }
  return;
};

const waitForClient = async () => {
  for (let i = 0; i < 8; i++) {
    const client = await getClient();
    if (client) {
      return client;
    }

    await log('no client');

    await new Promise<void>((resolve) => {
      sw.setTimeout(() => {
        resolve();
      }, 250);
    });
  }

  await log('create client');
  return await sw.clients.openWindow('/ios-pwa');
};

const onNotificationClick = async (event: NotificationEvent) => {
  await log('notificationclick event');
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

  const client = await waitForClient();

  if (!client) {
    await log('no client');
    return;
  }
  await log({
    client: {
      id: client.id,
      type: client.type,
      frameType: client.frameType,
      focused: client.focused,
    },
  });
  const openLink = `x-safari-https://${location.host}${link}`;
  await log({ openLink });
  await client.navigate(openLink);

  const clients = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true });
  await log(
    clients.map((client) => {
      return {
        id: client.id,
        type: client.type,
        frameType: client.frameType,
        focused: client.focused,
      };
    }),
  );
};

sw.addEventListener('notificationclick', (event) => {
  event.waitUntil(onNotificationClick(event));
});
