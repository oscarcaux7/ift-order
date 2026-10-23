<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { isFirebaseConfigured } from '@/firebase/config';
import { 
  PlusCircle, 
  Layers, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  Database,
  ExternalLink,
  Cpu
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isCurrent = (path) => {
  if (path === '/' && route.path === '/') return true;
  if (path !== '/' && route.path.startsWith(path)) return true;
  return false;
};

const handleLogout = async () => {
  await authStore.logout();
  if (route.path === '/auth') {
    router.push('/');
  }
};
</script>

<template>
  <header class="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/95 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between min-h-[76px] py-3 gap-4">
        
        <!-- Left: Logo, Identity & Mode Badge -->
        <div class="flex items-center gap-4 sm:gap-6 min-w-0">
          <router-link to="/" class="flex items-center gap-3.5 group shrink-0">
            <div class="w-10 h-10 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-mono font-bold text-sm tracking-tight group-hover:bg-neutral-800 transition-colors shadow-sm shrink-0">
              IFT
            </div>
            <div class="flex flex-col justify-center">
              <div class="flex items-center gap-2">
                <span class="text-sm sm:text-base font-semibold tracking-tight text-neutral-900 leading-snug">
                  Institute for Future Technologies
                </span>
                <span class="hidden sm:inline-block text-[11px] font-mono text-neutral-400 border border-neutral-200 rounded px-1.5 py-0.5 shrink-0">
                  DeVinci
                </span>
              </div>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-xs text-neutral-500 font-mono tracking-tight">
                  Commandes & Matériel
                </span>
                <!-- Integrated Status Pill: firmly located here, never overlaps navbar links -->
                <span 
                  :title="isFirebaseConfigured ? 'Connecté à Firebase Cloud Firestore en direct' : 'Mode Démo & Stockage local actif'"
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border shrink-0"
                  :class="isFirebaseConfigured 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-stone-100 text-neutral-600 border-neutral-200'"
                >
                  <span 
                    class="w-1.5 h-1.5 rounded-full" 
                    :class="isFirebaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'"
                  />
                  <span>{{ isFirebaseConfigured ? 'Firebase En Direct' : 'Mode Démo' }}</span>
                </span>
              </div>
            </div>
          </router-link>

          <!-- Navigation Links (visible on desktop) -->
          <nav class="hidden lg:flex items-center gap-1.5 ml-2 pl-4 border-l border-neutral-200 shrink-0">
            <router-link
              to="/"
              :class="[
                'inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-all',
                isCurrent('/')
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              ]"
            >
              <PlusCircle class="w-4 h-4" />
              <span>Nouvelle Demande</span>
            </router-link>

            <router-link
              to="/orders"
              :class="[
                'inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-all whitespace-nowrap',
                isCurrent('/orders')
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              ]"
            >
              <Layers class="w-4 h-4" />
              <span>Suivi & Commandes</span>
            </router-link>
          </nav>
        </div>

        <!-- Right: Actions & Profile -->
        <div class="flex items-center gap-3 shrink-0">
          
          <!-- Official Lab Link -->
          <a
            href="https://ift.devinci.fr"
            target="_blank"
            rel="noopener noreferrer"
            class="hidden xl:inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 px-2.5 py-1.5 rounded-md hover:bg-neutral-100 transition-colors"
            title="Ouvrir le site officiel de l'IFT"
          >
            <span class="font-mono text-xs">ift.devinci.fr</span>
            <ExternalLink class="w-3.5 h-3.5 text-neutral-400" />
          </a>

          <!-- User State -->
          <div v-if="authStore.isAuthenticated" class="flex items-center gap-2.5 pl-2.5 border-l border-neutral-200">
            <div class="flex flex-col text-right">
              <span class="text-xs sm:text-sm font-medium text-neutral-900 leading-tight">
                {{ authStore.user?.displayName }}
              </span>
              <span class="text-[11px] font-mono text-neutral-500 flex items-center justify-end gap-1 mt-0.5">
                <ShieldCheck class="w-3.5 h-3.5 text-sky-600" />
                {{ authStore.isAdmin ? 'Lab Manager' : 'Membre' }}
              </span>
            </div>
            
            <button
              @click="handleLogout"
              class="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
              title="Se déconnecter"
            >
              <LogOut class="w-4 h-4" />
            </button>
          </div>

          <div v-else class="flex items-center gap-2">
            <!-- 1-Click Fast Demo Switcher for Evaluators -->
            <button
              type="button"
              @click="authStore.loginDemoLabManager()"
              class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-md transition-colors shadow-2xs whitespace-nowrap"
              title="Activer immédiatement le rôle Lab Manager pour tester l'arbitrage des commandes"
            >
              <ShieldCheck class="w-3.5 h-3.5 text-amber-600" />
              <span>Démo Manager</span>
            </button>

            <router-link
              to="/auth"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-md border border-neutral-200 transition-colors whitespace-nowrap"
            >
              <LogIn class="w-3.5 h-3.5 text-neutral-500" />
              <span>Connexion</span>
            </router-link>
          </div>
        </div>

      </div>

      <!-- Mobile Navigation sub-bar (< lg screens) -->
      <div class="flex lg:hidden items-center justify-between py-2.5 border-t border-neutral-100 gap-2">
        <router-link
          to="/"
          :class="[
            'flex-1 text-center py-2 text-xs font-medium rounded-md transition-colors',
            isCurrent('/') ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          ]"
        >
          Nouvelle Demande
        </router-link>
        <router-link
          to="/orders"
          :class="[
            'flex-1 text-center py-2 text-xs font-medium rounded-md transition-colors',
            isCurrent('/orders') ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          ]"
        >
          Suivi des Commandes
        </router-link>
      </div>

    </div>
  </header>
</template>
