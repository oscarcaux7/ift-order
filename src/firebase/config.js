import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

export const isFirebaseConfigured = Boolean(
  apiKey && 
  apiKey !== 'your_api_key_here' && 
  projectId && 
  projectId !== 'ift-order-system'
);

let app = null;
let db = null;
let auth = null;

if (isFirebaseConfigured) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.info('[IFT Order] Firebase initialisé avec succès.');
  } catch (error) {
    console.warn('[IFT Order] Erreur lors de l’initialisation de Firebase, bascule en mode stockage local / démo :', error);
  }
} else {
  console.info('[IFT Order] Configuration Firebase non détectée ou incomplète. Mode démo & stockage local actif.');
}

export { app, db, auth };
