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
    console.log('onMessage', payload);
    if (Notification.permission === 'granted') {
      const { title, body } = payload.notification || {};
      const link = payload.fcmOptions?.link;

      const notification = new Notification(title || 'タイトル', {
        body: body || '',
      });

      console.log({ link });
      if (link) {
        notification.addEventListener('click', () => {
          console.log('notification click');
          location.href = link;
        });
      }
    }
  });

  // https://github.com/firebase/firebase-js-sdk/issues/3922#issuecomment-1197002484
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('SW MSG:', event.data);
    if (event.data.messageType === 'notification-clicked') {
      window.location.href = event.data.notification.click_action;
    }
    if (event.data.type === 'open') {
      console.log('open');
      window.location.href = event.data.link;
    }
  });
};
