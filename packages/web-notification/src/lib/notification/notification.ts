import { PUBLIC_FIREBASE_VAPID_KEY } from '$env/static/public';
import type { Messaging } from 'firebase/messaging';
import { getMessaging as getMessaging_, getToken, onMessage } from 'firebase/messaging';
import { getFirebaseApp } from './firebase';

let _messaging: Messaging | undefined;

const getMessaging = () => {
  if (!_messaging) {
    _messaging = getMessaging_(getFirebaseApp());
  }
  return _messaging;
};

export const getNotificationToken = async () => {
  const messaging = getMessaging();

  const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration();
  if (!serviceWorkerRegistration) {
    throw new Error('Missing serviceWorkerRegistration');
  }

  const token = await getToken(messaging, {
    vapidKey: PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration,
  });

  return token;
};

export const listenOnMessage = () => {
  const messaging = getMessaging();
  onMessage(messaging, (payload) => {
    console.log({ payload });
  });
};
