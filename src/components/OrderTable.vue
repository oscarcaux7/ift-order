<script setup>
import { computed } from 'vue';
import StatusBadge from '@/components/StatusBadge.vue';
import { 
  ExternalLink, 
  Eye, 
  AlertCircle, 
  Clock, 
  ArrowUpRight, 
  User, 
  FolderGit2, 
  PackageCheck 
} from 'lucide-vue-next';

const props = defineProps({
  orders: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select']);

const formatDate = (isoString) => {
  if (!isoString) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
};

const getUrgencyBadge = (urgency) => {
  if (urgency === 'urgent') return { label: 'Urgent', class: 'text-rose-700 bg-rose-50 border-rose-200' };
  if (urgency === 'low') return { label: 'Basse', class: 'text-neutral-500 bg-neutral-100 border-neutral-200' };
  return { label: 'Normale', class: 'text-sky-700 bg-sky-50 border-sky-200' };
};
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="py-16 text-center">
      <div class="inline-block w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="text-xs font-mono text-neutral-500">Chargement des commandes en cours...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!orders.length" class="py-16 text-center bg-white border border-neutral-200 rounded-xl p-8">
      <div class="w-12 h-12 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-3">
        <PackageCheck class="w-6 h-6" />
      </div>
      <h3 class="text-sm font-semibold text-neutral-900 mb-1">Aucune commande trouvée</h3>
      <p class="text-xs text-neutral-500 max-w-sm mx-auto">
        Aucune commande ne correspond aux filtres ou à la recherche courante.
      </p>
    </div>

    <!-- Desktop Table View -->
    <div v-else class="hidden md:block bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
      <table class="min-w-full divide-y divide-neutral-200 text-left text-xs">
        <thead class="bg-neutral-50/80 font-mono text-[11px] text-neutral-500 uppercase tracking-wider">
          <tr>
            <th scope="col" class="px-4 py-3">Réf. Commande</th>
            <th scope="col" class="px-4 py-3">Date</th>
            <th scope="col" class="px-4 py-3">Demandeur</th>
            <th scope="col" class="px-4 py-3">Projet IFT</th>
            <th scope="col" class="px-4 py-3">Articles</th>
            <th scope="col" class="px-4 py-3 text-right">Total TTC</th>
            <th scope="col" class="px-4 py-3 text-center">Statut</th>
            <th scope="col" class="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100">
          <tr
            v-for="order in orders"
            :key="order.id"
            @click="emit('select', order)"
            class="hover:bg-neutral-50/70 transition-colors cursor-pointer group"
          >
            <!-- Tracking Ref -->
            <td class="px-4 py-3.5 font-mono font-semibold text-neutral-900 whitespace-nowrap">
              <span class="group-hover:text-black group-hover:underline">
                {{ order.trackingCode || order.id }}
              </span>
              <div v-if="order.urgency === 'urgent'" class="mt-0.5">
                <span class="text-[10px] font-mono px-1.5 py-0.2 rounded border bg-rose-50 text-rose-700 border-rose-200">
                  URGENT
                </span>
              </div>
            </td>

            <!-- Date -->
            <td class="px-4 py-3.5 font-mono text-neutral-500 whitespace-nowrap">
              {{ formatDate(order.createdAt) }}
            </td>

            <!-- Demandeur -->
            <td class="px-4 py-3.5 max-w-[180px]">
              <div class="font-medium text-neutral-900 truncate">{{ order.applicant?.name }}</div>
              <div class="text-[11px] text-neutral-500 font-mono truncate">{{ order.applicant?.email }}</div>
            </td>

            <!-- Projet -->
            <td class="px-4 py-3.5 max-w-[160px]">
              <div class="font-medium text-neutral-900 truncate">{{ order.project?.name }}</div>
              <div class="text-[10px] text-neutral-400 font-mono truncate">{{ order.project?.code }}</div>
            </td>

            <!-- Articles preview -->
            <td class="px-4 py-3.5 max-w-[200px]">
              <div class="text-neutral-800 font-medium truncate">
                {{ order.items?.[0]?.description }}
              </div>
              <div v-if="order.items?.length > 1" class="text-[11px] text-neutral-500 font-mono">
                +{{ order.items.length - 1 }} autre(s) article(s)
              </div>
            </td>

            <!-- Total -->
            <td class="px-4 py-3.5 font-mono font-semibold text-neutral-900 text-right whitespace-nowrap">
              {{ Number(order.totalEstimatedPrice || 0).toFixed(2) }} €
            </td>

            <!-- Statut -->
            <td class="px-4 py-3.5 text-center whitespace-nowrap">
              <StatusBadge :status="order.status" size="xs" />
            </td>

            <!-- Action -->
            <td class="px-4 py-3.5 text-right whitespace-nowrap">
              <button
                type="button"
                @click.stop="emit('select', order)"
                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:text-black bg-white hover:bg-neutral-100 border border-neutral-200 rounded transition-colors"
              >
                <Eye class="w-3.5 h-3.5" />
                <span>Consulter</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards View -->
    <div v-if="orders.length" class="md:hidden space-y-3">
      <div
        v-for="order in orders"
        :key="order.id"
        @click="emit('select', order)"
        class="bg-white border border-neutral-200 rounded-lg p-4 active:bg-neutral-50 transition-colors shadow-xs"
      >
        <div class="flex items-center justify-between pb-2 border-b border-neutral-100 mb-2.5">
          <span class="font-mono font-bold text-sm text-neutral-900">
            {{ order.trackingCode || order.id }}
          </span>
          <StatusBadge :status="order.status" size="xs" />
        </div>

        <div class="space-y-1.5 text-xs text-neutral-600">
          <div class="flex items-center justify-between">
            <span class="text-neutral-400">Demandeur :</span>
            <span class="font-medium text-neutral-900">{{ order.applicant?.name }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-neutral-400">Projet :</span>
            <span class="font-medium text-neutral-900">{{ order.project?.name }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-neutral-400">Articles ({{ order.items?.length || 0 }}) :</span>
            <span class="font-medium text-neutral-800 truncate max-w-[180px]">{{ order.items?.[0]?.description }}</span>
          </div>

          <div class="flex items-center justify-between pt-1 border-t border-neutral-100">
            <span class="font-mono text-neutral-400">{{ formatDate(order.createdAt) }}</span>
            <span class="font-mono font-bold text-neutral-900 text-sm">
              {{ Number(order.totalEstimatedPrice || 0).toFixed(2) }} €
            </span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
