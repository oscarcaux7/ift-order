<script setup>
import { ref, computed, watch } from 'vue';
import { useOrderStore, STATUS_MAP } from '@/stores/orderStore';
import { useAuthStore } from '@/stores/authStore';
import StatusBadge from '@/components/StatusBadge.vue';
import { 
  X, 
  ExternalLink, 
  Calendar, 
  User, 
  FolderGit2, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Trash2,
  Save,
  MessageSquare,
  Truck
} from 'lucide-vue-next';

const props = defineProps({
  order: {
    type: Object,
    default: null
  },
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const orderStore = useOrderStore();
const authStore = useAuthStore();

const editStatus = ref('pending');
const editNotes = ref('');
const editDeliveryDate = ref('');
const isSaving = ref(false);
const saveSuccess = ref(false);

const initEditFields = () => {
  if (props.order) {
    editStatus.value = props.order.status || 'pending';
    editNotes.value = props.order.statusNotes || '';
    editDeliveryDate.value = props.order.estimatedDeliveryDate || '';
  }
};

watch(() => props.order, (newVal) => {
  if (newVal) {
    initEditFields();
  }
}, { immediate: true });

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.order) {
    initEditFields();
  }
});

const formatDate = (isoString) => {
  if (!isoString) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
};

const urgencyClass = computed(() => {
  switch (props.order?.urgency) {
    case 'urgent': return 'text-rose-700 bg-rose-50 border-rose-200';
    case 'low': return 'text-neutral-600 bg-neutral-100 border-neutral-200';
    default: return 'text-sky-700 bg-sky-50 border-sky-200';
  }
});

const urgencyLabel = computed(() => {
  switch (props.order?.urgency) {
    case 'urgent': return 'Urgent (Bloquant)';
    case 'low': return 'Basse priorité';
    default: return 'Normale';
  }
});

const handleSaveStatus = async () => {
  if (!props.order) return;
  isSaving.value = true;
  saveSuccess.value = false;

  await orderStore.updateOrderStatus(
    props.order.id, 
    editStatus.value, 
    editNotes.value, 
    editDeliveryDate.value
  );

  props.order.status = editStatus.value;
  props.order.statusNotes = editNotes.value;
  props.order.estimatedDeliveryDate = editDeliveryDate.value;
  props.order.updatedAt = new Date().toISOString();

  isSaving.value = false;
  saveSuccess.value = true;
  setTimeout(() => {
    saveSuccess.value = false;
  }, 2500);
};

const handleDelete = async () => {
  if (!props.order) return;
  const confirmDelete = window.confirm(
    `Êtes-vous sûr de vouloir supprimer définitivement la commande ${props.order.trackingCode || props.order.id} ?`
  );
  if (confirmDelete) {
    await orderStore.deleteOrder(props.order.id);
    emit('close');
  }
};
</script>

<template>
  <div
    v-if="isOpen && order"
    class="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    @click.self="emit('close')"
  >
    <div
      class="bg-white rounded-xl border border-neutral-200 max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
        <div class="flex items-center gap-3">
          <span class="text-base sm:text-lg font-mono font-bold tracking-tight text-neutral-900">
            {{ order.trackingCode || order.id }}
          </span>
          <StatusBadge :status="order.status" size="sm" />
        </div>

        <button
          @click="emit('close')"
          class="p-1.5 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors"
          title="Fermer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="overflow-y-auto p-5 sm:p-6 space-y-6">

        <!-- Grid Info (Demandeur, Projet, Dates) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-stone-50/60 rounded-lg border border-neutral-200">
          
          <!-- Demandeur -->
          <div class="space-y-1">
            <span class="text-[11px] font-mono text-neutral-500 uppercase flex items-center gap-1.5">
              <User class="w-3.5 h-3.5" />
              Demandeur
            </span>
            <p class="text-xs sm:text-sm font-semibold text-neutral-900">{{ order.applicant?.name }}</p>
            <p class="text-xs text-neutral-600 font-mono">{{ order.applicant?.email }}</p>
            <p class="text-[11px] text-neutral-500">{{ order.applicant?.role }}</p>
          </div>

          <!-- Projet & Urgence -->
          <div class="space-y-1">
            <span class="text-[11px] font-mono text-neutral-500 uppercase flex items-center gap-1.5">
              <FolderGit2 class="w-3.5 h-3.5" />
              Projet IFT
            </span>
            <p class="text-xs sm:text-sm font-semibold text-neutral-900">{{ order.project?.name }}</p>
            <p class="text-xs text-neutral-600 font-mono">{{ order.project?.code }}</p>
            <div class="pt-0.5">
              <span :class="['inline-block text-[10px] font-mono px-2 py-0.5 rounded border', urgencyClass]">
                Priorité : {{ urgencyLabel }}
              </span>
            </div>
          </div>

          <!-- Date Création & MAJ -->
          <div class="space-y-1">
            <span class="text-[11px] font-mono text-neutral-500 uppercase flex items-center gap-1.5">
              <Calendar class="w-3.5 h-3.5" />
              Chronologie
            </span>
            <p class="text-xs text-neutral-700">Créé le : <strong class="font-mono text-[11px]">{{ formatDate(order.createdAt) }}</strong></p>
            <p class="text-xs text-neutral-500">Mis à jour : <span class="font-mono text-[11px]">{{ formatDate(order.updatedAt) }}</span></p>
            <p v-if="order.estimatedDeliveryDate" class="text-xs text-emerald-700 font-medium pt-1 flex items-center gap-1">
              <Truck class="w-3.5 h-3.5" />
              Livraison estimée : <strong class="font-mono">{{ order.estimatedDeliveryDate }}</strong>
            </p>
          </div>

        </div>

        <!-- Justification Scientifique -->
        <div class="space-y-1.5">
          <h4 class="text-xs font-semibold text-neutral-800 uppercase tracking-wider font-mono">
            Justification & Contexte Scientifique
          </h4>
          <p class="text-xs sm:text-sm text-neutral-700 bg-white p-3.5 rounded-lg border border-neutral-200 leading-relaxed whitespace-pre-line">
            {{ order.justification || 'Aucune justification fournie.' }}
          </p>
        </div>

        <!-- Articles Table -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-semibold text-neutral-800 uppercase tracking-wider font-mono">
              Composants et Matériel Demandés ({{ order.items?.length || 0 }})
            </h4>
            <span class="text-xs font-mono font-semibold text-neutral-900">
              Total Estimé : {{ Number(order.totalEstimatedPrice || 0).toFixed(2) }} € TTC
            </span>
          </div>

          <div class="border border-neutral-200 rounded-lg overflow-hidden bg-white">
            <table class="min-w-full divide-y divide-neutral-200 text-left text-xs">
              <thead class="bg-neutral-50 font-mono text-[11px] text-neutral-500 uppercase">
                <tr>
                  <th scope="col" class="px-3 py-2.5">Article</th>
                  <th scope="col" class="px-3 py-2.5">Fournisseur & Réf</th>
                  <th scope="col" class="px-3 py-2.5 text-center">Qté</th>
                  <th scope="col" class="px-3 py-2.5 text-right">Prix Unitaire</th>
                  <th scope="col" class="px-3 py-2.5 text-right">Sous-total</th>
                  <th scope="col" class="px-3 py-2.5 text-center">Lien</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100">
                <tr v-for="(item, idx) in order.items" :key="idx" class="hover:bg-neutral-50/50">
                  <td class="px-3 py-2.5 font-medium text-neutral-900 max-w-[220px] truncate" :title="item.description">
                    {{ item.description }}
                  </td>
                  <td class="px-3 py-2.5 font-mono text-neutral-600">
                    <div>{{ item.supplier || '—' }}</div>
                    <div class="text-[10px] text-neutral-400">{{ item.reference || '—' }}</div>
                  </td>
                  <td class="px-3 py-2.5 font-mono text-center font-medium">
                    {{ item.quantity }}
                  </td>
                  <td class="px-3 py-2.5 font-mono text-right text-neutral-600">
                    {{ Number(item.unitPrice || 0).toFixed(2) }} €
                  </td>
                  <td class="px-3 py-2.5 font-mono text-right font-semibold text-neutral-900">
                    {{ (Number(item.quantity || 1) * Number(item.unitPrice || 0)).toFixed(2) }} €
                  </td>
                  <td class="px-3 py-2.5 text-center">
                    <a
                      v-if="item.url"
                      :href="item.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center text-neutral-400 hover:text-black p-1 rounded"
                      title="Ouvrir le lien marchand"
                    >
                      <ExternalLink class="w-3.5 h-3.5" />
                    </a>
                    <span v-else class="text-neutral-300 font-mono">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Notes / Suivi du Lab Manager -->
        <div v-if="order.statusNotes && !authStore.isAdmin" class="space-y-1">
          <h4 class="text-xs font-semibold text-neutral-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <MessageSquare class="w-3.5 h-3.5 text-neutral-500" />
            Remarques du Lab Manager
          </h4>
          <p class="text-xs text-neutral-700 bg-sky-50/50 border border-sky-100 rounded-lg p-3">
            {{ order.statusNotes }}
          </p>
        </div>

        <!-- Lab Manager Administration Panel -->
        <div 
          v-if="authStore.isAdmin" 
          class="p-4 bg-stone-50 border border-neutral-300 rounded-lg space-y-4"
        >
          <div class="flex items-center justify-between pb-2 border-b border-neutral-200">
            <span class="text-xs font-semibold uppercase tracking-wider font-mono text-neutral-900 flex items-center gap-1.5">
              <Clock class="w-3.5 h-3.5 text-sky-600" />
              Gestion & Mise à jour Lab Manager
            </span>
            <span class="text-[11px] font-mono text-neutral-500">Droits Administrateur IFT</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Statut Dropdown -->
            <div>
              <label class="block text-xs font-medium text-neutral-700 mb-1">
                Modifier le statut
              </label>
              <select
                v-model="editStatus"
                class="w-full text-xs font-medium px-3 py-2 border border-neutral-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              >
                <option v-for="(v, k) in STATUS_MAP" :key="k" :value="k">
                  {{ v.label }}
                </option>
              </select>
            </div>

            <!-- Date de livraison estimée -->
            <div>
              <label class="block text-xs font-medium text-neutral-700 mb-1">
                Date estimée d'arrivée au labo
              </label>
              <input
                v-model="editDeliveryDate"
                type="date"
                class="w-full text-xs font-mono px-3 py-2 border border-neutral-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>

            <!-- Remarques / Numéro de tracking Colissimo / Mouser -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-neutral-700 mb-1">
                Notes de suivi interne / Renseignements pour l'étudiant
              </label>
              <textarea
                v-model="editNotes"
                rows="2"
                placeholder="ex: Commande groupée envoyée au pôle achats. Réf Colissimo : ..., réception prévue mardi..."
                class="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
          </div>

          <div class="flex items-center justify-between pt-2">
            <button
              type="button"
              @click="handleDelete"
              class="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded transition-colors"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Supprimer la commande</span>
            </button>

            <button
              type="button"
              @click="handleSaveStatus"
              :disabled="isSaving"
              class="inline-flex items-center gap-1.5 px-3 py-2 bg-black text-white text-xs font-medium rounded-md hover:bg-neutral-800 transition-colors"
            >
              <Save class="w-3.5 h-3.5" />
              <span>{{ isSaving ? 'Mise à jour...' : 'Enregistrer les modifications' }}</span>
            </button>
          </div>

          <div v-if="saveSuccess" class="text-xs text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle class="w-3.5 h-3.5" />
            <span>Statut et remarques mis à jour avec succès.</span>
          </div>

        </div>

      </div>

      <!-- Modal Footer -->
      <div class="px-5 py-3 border-t border-neutral-200 bg-neutral-50/50 flex items-center justify-end">
        <button
          type="button"
          @click="emit('close')"
          class="px-4 py-2 text-xs font-medium text-neutral-700 hover:text-black border border-neutral-300 rounded-md bg-white transition-colors"
        >
          Fermer
        </button>
      </div>

    </div>
  </div>
</template>
