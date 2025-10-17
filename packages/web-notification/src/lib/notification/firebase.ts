import type { FirebaseApp, FirebaseOptions } from 'firebase/app'
import { PUBLIC_FIREBASE_CONFIG_JSON } from '$env/static/public'
import { initializeApp } from 'firebase/app'

let _app: FirebaseApp | undefined

export function getFirebaseApp() {
  if (!_app) {
    const firebaseConfig: FirebaseOptions = JSON.parse(PUBLIC_FIREBASE_CONFIG_JSON)
    _app = initializeApp(firebaseConfig)
  }

  return _app
}
