import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoDummyApiKeyForVitestTestingEnvironment12345',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'institutosermelhor.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || 'institutosermelhor',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'institutosermelhor.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Evita re-inicializar em hot-reload (Vite HMR)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;

