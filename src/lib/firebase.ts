import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAOXmFgxUzKZP6x_NXVwgkG-3tx0BhGVms",
  authDomain: "family-shares-app.firebaseapp.com",
  projectId: "family-shares-app",
  storageBucket: "family-shares-app.firebasestorage.app",
  messagingSenderId: "990609608338",
  appId: "1:990609608338:web:7f7dcb220c55c55953204b"
};

function createFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const app = createFirebaseApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
