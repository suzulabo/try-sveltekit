import { PUBLIC_FIREBASE_CONFIG_JSON } from '$env/static/public';
import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';

let _app: FirebaseApp | undefined;

export const getFirebaseApp = () => {
  if (!_app) {
    const firebaseConfig: FirebaseOptions = JSON.parse(PUBLIC_FIREBASE_CONFIG_JSON);
    _app = initializeApp(firebaseConfig);
  }

  return _app;
};
