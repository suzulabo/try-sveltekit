/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('install', (event) => {
  event.waitUntil(sw.skipWaiting());
});
sw.addEventListener('activate', (event) => {
  event.waitUntil(sw.clients.claim());
});

sw.addEventListener('push', (event) => {
  console.log('push event');

  event.waitUntil(
    (async () => {
      if (!event.data) {
        return;
      }
      const payload = event.data.json();

      console.log({ payload });

      const notification = payload.notification;

      await sw.registration.showNotification(notification.title, notification);
    })(),
  );
});
