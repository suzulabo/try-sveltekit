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

const fcmDefault = true;

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (fcmDefault) {
  const firebaseApp = getFirebaseApp();
  const messaging = getMessaging(firebaseApp);
  console.log(messaging);
} else {
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
}
