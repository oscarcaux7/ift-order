<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { CheckCircle2, Copy, Check, ExternalLink, ArrowRight, PlusCircle } from 'lucide-vue-next';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  orderSummary: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'newOrder']);
const router = useRouter();
const copied = ref(false);

const copyCode = async () => {
  if (!props.orderSummary.trackingCode) return;
  try {
    await navigator.clipboard.writeText(props.orderSummary.trackingCode);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy', err);
  }
};

const goToOrders = () => {
  emit('close');
  router.push('/orders');
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4"
  >
    <div 
      class="bg-white rounded-xl border border-neutral-200 max-w-lg w-full p-6 sm:p-8 shadow-xl transition-all"
      role="dialog"
      aria-modal="true"
    >
      <!-- Icon & Title -->
      <div class="text-center">
        <div class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <CheckCircle2 class="w-8 h-8" />
        </div>
        <h3 class="text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight">
          Demande d'achat soumise avec succès
        </h3>
        <p class="text-xs sm:text-sm text-neutral-500 mt-1">
          Votre réquisition a été enregistrée dans la file d'attente du laboratoire IFT.
        </p>
      </div>

      <!-- Tracking Code Box -->
      <div class="my-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-center">
        <span class="text-xs font-mono uppercase text-neutral-500 block mb-1">
          Numéro de suivi unique
        </span>
        <div class="flex items-center justify-center gap-3">
          <span class="text-xl sm:text-2xl font-mono font-bold tracking-wider text-neutral-900">
            {{ orderSummary.trackingCode || '#IFT-DEMO' }}
          </span>
          <button
            type="button"
            @click="copyCode"
            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium rounded border border-neutral-300 hover:border-black bg-white transition-colors"
            title="Copier le code"
          >
            <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-600" />
            <Copy v-else class="w-3.5 h-3.5 text-neutral-600" />
            <span>{{ copied ? 'Copié' : 'Copier' }}</span>
          </button>
        </div>
      </div>

      <!-- Summary Specs -->
      <div class="space-y-2 text-xs border-t border-neutral-100 pt-4 mb-6">
        <div class="flex justify-between py-1">
          <span class="text-neutral-500">Projet IFT :</span>
          <span class="font-medium text-neutral-900">{{ orderSummary.projectName }}</span>
        </div>
        <div class="flex justify-between py-1">
          <span class="text-neutral-500">Demandeur :</span>
          <span class="font-medium text-neutral-900">{{ orderSummary.applicantName }} ({{ orderSummary.applicantEmail }})</span>
        </div>
        <div class="flex justify-between py-1">
          <span class="text-neutral-500">Nombre d'articles :</span>
          <span class="font-medium text-neutral-900">{{ orderSummary.itemCount }} article(s)</span>
        </div>
        <div class="flex justify-between py-1 text-sm font-semibold border-t border-neutral-100 pt-2">
          <span class="text-neutral-900">Total estimé :</span>
          <span class="font-mono text-neutral-900">{{ Number(orderSummary.totalEstimatedPrice || 0).toFixed(2) }} € TTC</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          @click="goToOrders"
          class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-xs font-medium rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
        >
          <span>Accéder au suivi en direct</span>
          <ArrowRight class="w-4 h-4" />
        </button>
        <button
          type="button"
          @click="emit('newOrder')"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-300 text-neutral-700 hover:text-black hover:border-black text-xs font-medium rounded-md bg-white transition-colors"
        >
          <PlusCircle class="w-4 h-4 text-neutral-500" />
          <span>Nouvelle commande</span>
        </button>
      </div>

    </div>
  </div>
</template>
