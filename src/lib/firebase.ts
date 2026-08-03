/**
 * firebase.ts
 * Inicialização defensiva do Firebase SDK.
 * Nunca lança exceção em nível de módulo — qualquer falha é capturada e logada.
 * A flag FIREBASE_ENABLED controla se o Firestore real ou no-op é usado.
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

export const FIREBASE_ENABLED = Boolean(projectId);

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

if (FIREBASE_ENABLED) {
  try {
    const firebaseConfig = {
      apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId:         projectId,
      storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId:             import.meta.env.VITE_FIREBASE_APP_ID,
    };

    // Evita re-inicializar em hot-reload (Vite HMR)
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
  } catch (err) {
    console.error('[Firebase] Falha ao inicializar o Firebase SDK:', err);
    app = null;
    dbInstance = null;
  }
} else {
  if (import.meta.env.DEV) {
    console.warn('[Firebase] VITE_FIREBASE_PROJECT_ID não configurado. Usando dados mock locais.');
  }
}

// Exporta db — pode ser null se Firebase não estiver habilitado/falhou
// Os hooks verificam FIREBASE_ENABLED antes de usar db
export const db = dbInstance as Firestore;
export default app;
