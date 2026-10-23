<script setup>
import { ref, onMounted } from 'vue';
import HeaderNav from '@/components/HeaderNav.vue';
import { useOrderStore } from '@/stores/orderStore';
import { useAuthStore } from '@/stores/authStore';
import { ExternalLink, Sparkles, ShieldCheck, UserCheck, X } from 'lucide-vue-next';

const orderStore = useOrderStore();
const authStore = useAuthStore();
const showDemoBanner = ref(true);

onMounted(() => {
  orderStore.initStore();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#FBFBFC] text-[#111111]">
    
    <!-- Top Interactive Demo Banner -->
    <div 
      v-if="showDemoBanner"
      class="bg-neutral-900 text-white px-4 sm:px-6 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 transition-all"
    >
      <div class="flex items-center gap-2.5">
        <Sparkles class="w-4 h-4 text-amber-400 shrink-0" />
        <span class="font-mono text-xs text-neutral-300">
          Session Démo — Rôle actif : 
          <strong class="text-white font-semibold">
            {{ authStore.isAdmin ? 'Lab Manager (Validation & Droits Administrateur)' : 'Étudiant / Demandeur' }}
          </strong>
        </span>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="authStore.toggleDemoRole()"
          class="font-mono text-xs px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ShieldCheck v-if="!authStore.isAdmin" class="w-3.5 h-3.5 text-amber-400" />
          <UserCheck v-else class="w-3.5 h-3.5 text-emerald-400" />
          <span>{{ authStore.isAdmin ? 'Passer en vue Demandeur' : 'Passer en Lab Manager' }}</span>
        </button>

        <button
          type="button"
          @click="showDemoBanner = false"
          class="text-neutral-400 hover:text-white p-0.5 transition-colors"
          title="Masquer le bandeau"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Sticky Navigation Bar -->
    <HeaderNav />

    <!-- Main View Content -->
    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Lab Minimal Footer -->
    <footer class="border-t border-neutral-200/80 bg-white py-8 mt-12 text-xs text-neutral-500">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div class="flex items-center gap-3 text-center sm:text-left">
          <span class="w-6 h-6 rounded bg-neutral-900 text-white font-mono text-[10px] font-bold flex items-center justify-center">
            IFT
          </span>
          <div>
            <p class="font-medium text-neutral-800">
              Institute for Future Technologies
            </p>
            <p class="text-[11px] text-neutral-400 font-mono">
              Pôle Léonard de Vinci — 47 Boulevard de Pesaro, 92000 Nanterre
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4 text-[11px] font-mono">
          <a
            href="https://ift.devinci.fr"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-black inline-flex items-center gap-1 transition-colors"
          >
            <span>ift.devinci.fr</span>
            <ExternalLink class="w-3 h-3" />
          </a>
          <span class="text-neutral-300">|</span>
          <span class="text-neutral-400">Mode Démo Prêt à l'Emploi</span>
          <span class="text-neutral-300">|</span>
          <router-link to="/orders" class="hover:text-black transition-colors">
            Suivi des commandes
          </router-link>
        </div>

      </div>
    </footer>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
