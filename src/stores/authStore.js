import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/firebase/config';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const loading = ref(true);
  const authError = ref(null);

  // Check persistent demo manager session from localStorage
  const savedDemoUser = localStorage.getItem('ift_demo_user');
  if (savedDemoUser) {
    try {
      user.value = JSON.parse(savedDemoUser);
    } catch {
      localStorage.removeItem('ift_demo_user');
    }
  }

  // Setup Firebase Auth listener if active
  if (isFirebaseConfigured && auth) {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilisateur',
          photoURL: firebaseUser.photoURL || null,
          role: firebaseUser.email?.includes('devinci.fr') ? 'admin' : 'researcher',
          isDemo: false
        };
        localStorage.removeItem('ift_demo_user');
      } else if (!savedDemoUser) {
        user.value = null;
      }
      loading.value = false;
    });
  } else {
    loading.value = false;
  }

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => {
    if (!user.value) return false;
    return user.value.role === 'admin' || user.value.role === 'manager';
  });

  const loginWithGoogle = async () => {
    authError.value = null;
    if (isFirebaseConfigured && auth) {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ hd: 'devinci.fr' });
        const result = await signInWithPopup(auth, provider);
        user.value = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          role: 'admin',
          isDemo: false
        };
        return { success: true };
      } catch (err) {
        authError.value = err.message;
        return { success: false, error: err.message };
      }
    } else {
      // Demo / offline fallback
      loginDemoLabManager();
      return { success: true, demo: true };
    }
  };

  const loginWithEmail = async (email, password) => {
    authError.value = null;
    if (isFirebaseConfigured && auth) {
      try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        user.value = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.email?.split('@')[0],
          role: 'admin',
          isDemo: false
        };
        return { success: true };
      } catch (err) {
        authError.value = "Identifiants invalides ou service Firebase non joignable.";
        return { success: false, error: authError.value };
      }
    } else {
      // Simple mock email verification
      if (email && password) {
        user.value = {
          uid: 'demo_manager_01',
          email,
          displayName: email.split('@')[0],
          role: 'admin',
          isDemo: true
        };
        localStorage.setItem('ift_demo_user', JSON.stringify(user.value));
        return { success: true };
      }
      return { success: false, error: "Veuillez saisir une adresse email et un mot de passe." };
    }
  };

  const loginDemoLabManager = () => {
    user.value = {
      uid: 'demo_ift_lab_manager',
      email: 'lab.manager@devinci.fr',
      displayName: 'IFT Lab Manager (Démo)',
      role: 'admin',
      isDemo: true
    };
    localStorage.setItem('ift_demo_user', JSON.stringify(user.value));
  };

  const logout = async () => {
    authError.value = null;
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Erreur lors de la déconnexion Firebase :", err);
      }
    }
    user.value = null;
    localStorage.removeItem('ift_demo_user');
  };

  return {
    user,
    loading,
    authError,
    isAuthenticated,
    isAdmin,
    loginWithGoogle,
    loginWithEmail,
    loginDemoLabManager,
    logout
  };
});
