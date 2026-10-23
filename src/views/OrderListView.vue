<script setup>
import { ref, onMounted } from 'vue';
import { useOrderStore, IFT_PROJECTS, STATUS_MAP } from '@/stores/orderStore';
import { useAuthStore } from '@/stores/authStore';
import OrderTable from '@/components/OrderTable.vue';
import OrderDetailModal from '@/components/OrderDetailModal.vue';
import { 
  Search, 
  Download, 
  Filter, 
  RotateCw, 
  Layers, 
  Clock, 
  CheckCircle, 
  CreditCard,
  PlusCircle,
  X
} from 'lucide-vue-next';

const orderStore = useOrderStore();
const authStore = useAuthStore();

const selectedOrder = ref(null);
const isModalOpen = ref(false);

onMounted(() => {
  orderStore.initStore();
});

const openOrderModal = (order) => {
  selectedOrder.value = order;
  isModalOpen.value = true;
};

const closeOrderModal = () => {
  isModalOpen.value = false;
  selectedOrder.value = null;
};

const handleExport = () => {
  orderStore.exportOrdersCSV();
};

const filterTabs = [
  { key: 'all', label: 'Toutes' },
  { key: 'pending', label: 'En attente' },
  { key: 'approved', label: 'Approuvées' },
  { key: 'ordered', label: 'Commandées' },
  { key: 'delivered', label: 'Au labo' },
  { key: 'rejected', label: 'Rejetées' }
];
</script>

<template>
  <div class="py-8 sm:py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-semibold tracking-tight text-neutral-900">
              Suivi & Historique des Commandes
            </h1>
            <span class="text-xs font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
              {{ orderStore.orders.length }} commande(s)
            </span>
          </div>
          <p class="mt-1 text-xs sm:text-sm text-neutral-500">
            Tableau de bord des réquisitions, arbitrages des Lab Managers et livraisons de composants.
          </p>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-2.5">
          <router-link
            to="/"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-xs"
          >
            <PlusCircle class="w-3.5 h-3.5" />
            <span>Nouvelle Demande</span>
          </router-link>

          <button
            type="button"
            @click="handleExport"
            :disabled="!orderStore.filteredOrders.length"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-800 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-md transition-colors disabled:opacity-50"
            title="Exporter la sélection courante au format CSV (Excel/Sheets)"
          >
            <Download class="w-3.5 h-3.5 text-neutral-500" />
            <span>Export CSV Achats</span>
          </button>
        </div>
      </div>

      <!-- Quick KPI Counters -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
        <div class="bg-white border border-neutral-200 rounded-lg p-3.5 sm:p-4 shadow-xs">
          <span class="text-[11px] font-mono uppercase text-neutral-400 block">Total Commandes</span>
          <div class="flex items-baseline justify-between mt-1">
            <span class="text-xl sm:text-2xl font-mono font-bold text-neutral-900">{{ orderStore.counts.all }}</span>
            <span class="text-[11px] text-neutral-500 font-mono">Archive globale</span>
          </div>
        </div>

        <div class="bg-white border border-neutral-200 rounded-lg p-3.5 sm:p-4 shadow-xs">
          <span class="text-[11px] font-mono uppercase text-neutral-400 block">En attente de validation</span>
          <div class="flex items-baseline justify-between mt-1">
            <span class="text-xl sm:text-2xl font-mono font-bold text-amber-600">{{ orderStore.counts.pending }}</span>
            <span class="text-[11px] text-neutral-500 font-mono">À arbitrer</span>
          </div>
        </div>

        <div class="bg-white border border-neutral-200 rounded-lg p-3.5 sm:p-4 shadow-xs">
          <span class="text-[11px] font-mono uppercase text-neutral-400 block">En cours d'acheminement</span>
          <div class="flex items-baseline justify-between mt-1">
            <span class="text-xl sm:text-2xl font-mono font-bold text-sky-600">
              {{ orderStore.counts.approved + orderStore.counts.ordered }}
            </span>
            <span class="text-[11px] text-neutral-500 font-mono">Approuvé / Passé</span>
          </div>
        </div>

        <div class="bg-white border border-neutral-200 rounded-lg p-3.5 sm:p-4 shadow-xs">
          <span class="text-[11px] font-mono uppercase text-neutral-400 block">Montant Cumulé Estimé</span>
          <div class="flex items-baseline justify-between mt-1">
            <span class="text-xl sm:text-2xl font-mono font-bold text-neutral-900">
              {{ orderStore.totalAmount.toFixed(2) }} €
            </span>
            <span class="text-[11px] text-neutral-500 font-mono">TTC</span>
          </div>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-white border border-neutral-200 rounded-xl p-4 mb-6 shadow-xs space-y-4">
        
        <!-- Status Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-neutral-100 scrollbar-none">
          <button
            v-for="tab in filterTabs"
            :key="tab.key"
            @click="orderStore.activeFilter = tab.key"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors',
              orderStore.activeFilter === tab.key
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            ]"
          >
            <span>{{ tab.label }}</span>
            <span 
              :class="[
                'text-[10px] font-mono px-1.5 py-0.2 rounded-full',
                orderStore.activeFilter === tab.key ? 'bg-neutral-700 text-white' : 'bg-neutral-100 text-neutral-600'
              ]"
            >
              {{ orderStore.counts[tab.key] }}
            </span>
          </button>
        </div>

        <!-- Search & Project Select Row -->
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          <!-- Search input -->
          <div class="sm:col-span-8 relative">
            <Search class="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              v-model="orderStore.searchQuery"
              type="text"
              placeholder="Rechercher par référence (#IFT-...), nom de demandeur, composant ou fournisseur..."
              class="w-full text-xs sm:text-sm pl-9 pr-8 py-2 border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black placeholder:text-neutral-400"
            />
            <button
              v-if="orderStore.searchQuery"
              @click="orderStore.searchQuery = ''"
              class="absolute right-2.5 top-2.5 text-neutral-400 hover:text-black"
              title="Effacer la recherche"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Project Filter -->
          <div class="sm:col-span-4">
            <select
              v-model="orderStore.selectedProject"
              class="w-full text-xs sm:text-sm px-3 py-2 border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            >
              <option value="all">Tous les projets IFT</option>
              <option v-for="p in IFT_PROJECTS" :key="p.code" :value="p.name">
                {{ p.name }}
              </option>
            </select>
          </div>

        </div>

      </div>

      <!-- Main Order Table -->
      <OrderTable
        :orders="orderStore.filteredOrders"
        :loading="orderStore.loading"
        @select="openOrderModal"
      />

    </div>

    <!-- Order Detail Slide/Modal -->
    <OrderDetailModal
      :order="selectedOrder"
      :is-open="isModalOpen"
      @close="closeOrderModal"
    />

  </div>
</template>
