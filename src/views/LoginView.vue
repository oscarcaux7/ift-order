<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { isFirebaseConfigured } from '@/firebase/config';
import { 
  ShieldCheck, 
  LogIn, 
  AlertCircle, 
  CheckCircle, 
  Lock, 
  Mail, 
  ArrowRight,
  Sparkles
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMsg = ref('');

const handleGoogleLogin = async () => {
  isLoading.value = true;
  errorMsg.value = '';
  const res = await authStore.loginWithGoogle();
  isLoading.value = false;
  if (res.success) {
    router.push('/orders');
  } else {
    errorMsg.value = res.error || 'Erreur lors de la connexion Google';
  }
};

const handleEmailLogin = async () => {
  if (!email.value || !password.value) {
    errorMsg.value = 'Veuillez saisir votre email et votre mot de passe.';
    return;
  }
  isLoading.value = true;
  errorMsg.value = '';
  const res = await authStore.loginWithEmail(email.value, password.value);
  isLoading.value = false;
  if (res.success) {
    router.push('/orders');
  } else {
    errorMsg.value = res.error || 'Identifiants incorrects.';
  }
};

const handleDemoLogin = () => {
  authStore.loginDemoLabManager();
  router.push('/orders');
};
</script>

<template>
  <div class="py-12 sm:py-16">
    <div class="max-w-md mx-auto px-4 sm:px-6">
      
      <!-- Brand & Title -->
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-mono font-bold text-lg mx-auto mb-3 shadow-sm">
          IFT
        </div>
        <h1 class="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
          Espace Lab Manager
        </h1>
        <p class="text-xs sm:text-sm text-neutral-500 mt-1">
          Authentification réservée aux responsables de laboratoire et encadrants IFT
        </p>
      </div>

      <!-- Main Login Card -->
      <div class="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 shadow-xs">
        
        <!-- Error notification -->
        <div
          v-if="errorMsg"
          class="mb-5 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2"
        >
          <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
          <span>{{ errorMsg }}</span>
        </div>

        <!-- Google OAuth Button (DeVinci) -->
        <button
          type="button"
          @click="handleGoogleLogin"
          :disabled="isLoading"
          class="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-neutral-300 rounded-md text-xs sm:text-sm font-medium text-neutral-800 bg-white hover:bg-neutral-50 hover:border-black transition-colors shadow-xs"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuer avec un compte DeVinci</span>
        </button>

        <div class="relative my-6 text-center">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-neutral-200"></div>
          </div>
          <span class="relative bg-white px-3 text-[11px] font-mono text-neutral-400 uppercase">
            ou par e-mail
          </span>
        </div>

        <!-- Email & Password Form -->
        <form @submit.prevent="handleEmailLogin" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-neutral-700 mb-1">
              Adresse e-mail
            </label>
            <div class="relative">
              <Mail class="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                v-model="email"
                type="email"
                placeholder="nom.prenom@devinci.fr"
                class="w-full text-xs sm:text-sm pl-9 pr-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-neutral-700 mb-1">
              Mot de passe
            </label>
            <div class="relative">
              <Lock class="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                v-model="password"
                type="password"
                placeholder="••••••••••••"
                class="w-full text-xs sm:text-sm pl-9 pr-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <LogIn class="w-4 h-4" />
            <span>Se connecter</span>
          </button>
        </form>

        <!-- Fast 1-Click Demo Section -->
        <div class="mt-6 pt-5 border-t border-neutral-100 text-center">
          <p class="text-xs text-neutral-500 mb-3">
            Vous souhaitez tester immédiatement l'interface d'administration ?
          </p>
          <button
            type="button"
            @click="handleDemoLogin"
            class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono font-medium rounded-md bg-stone-100 hover:bg-stone-200 text-neutral-800 border border-neutral-300 transition-colors"
          >
            <Sparkles class="w-3.5 h-3.5 text-amber-600" />
            <span>Activer la session Démo Lab Manager</span>
          </button>
        </div>

      </div>

      <!-- Notice on Public Access -->
      <div class="mt-6 text-center">
        <router-link
          to="/"
          class="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black transition-colors font-mono"
        >
          <span>Retour au formulaire de commande public</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </router-link>
      </div>

    </div>
  </div>
</template>
