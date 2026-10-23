import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD9NE_SU27kKamzcoqpRVkonr06om8D6YM";
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ift-order-systele.firebaseapp.com";
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "ift-order-systele";
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ift-order-systele.firebasestorage.app";
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "539073675322";
const appId = import.meta.env.VITE_FIREBASE_APP_ID || "1:539073675322:web:6314077772d99bfb17b503";

export const isFirebaseConfigured = Boolean(
  apiKey && 
  apiKey !== 'your_api_key_here' && 
  apiKey.startsWith('AIza') &&
  projectId
);

let app = null;
let db = null;
let auth = null;

if (isFirebaseConfigured) {
  try {
    const firebaseConfig = {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId
    };

    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.info('[IFT Order] Firebase initialisé avec succès sur le projet :', projectId);
  } catch (error) {
    console.warn('[IFT Order] Erreur lors de l’initialisation de Firebase, bascule en mode stockage local / démo :', error);
  }
} else {
  console.info('[IFT Order] Configuration Firebase non détectée ou incomplète. Mode démo & stockage local actif.');
}

export { app, db, auth };
