<script setup>
import { computed } from 'vue';
import { Trash2, ExternalLink, AlertCircle } from 'lucide-vue-next';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  canRemove: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['remove', 'update']);

const lineTotal = computed(() => {
  const qty = Number(props.item.quantity) || 0;
  const price = Number(props.item.unitPrice) || 0;
  return (qty * price).toFixed(2);
});

const isUrlValid = computed(() => {
  if (!props.item.url) return true; // not filled yet
  try {
    const parsed = new URL(props.item.url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
});

const supplierSuggestions = [
  'Mouser',
  'DigiKey',
  'RS Components',
  'Farnell',
  'Gotronic',
  'Amazon',
  'Adafruit',
  'Seeed Studio',
  'SparkFun',
  'Reichelt'
];
</script>

<template>
  <div class="relative bg-white border border-neutral-200 rounded-lg p-4 sm:p-5 transition-shadow hover:shadow-xs">
    
    <!-- Row Header: Item index & Remove -->
    <div class="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
      <div class="flex items-center gap-2">
        <span class="w-5 h-5 rounded-full bg-neutral-100 text-neutral-700 font-mono text-[11px] font-semibold flex items-center justify-center">
          {{ index + 1 }}
        </span>
        <span class="text-xs font-semibold text-neutral-800 uppercase tracking-wider font-mono">
          Article #{{ index + 1 }}
        </span>
      </div>

      <div class="flex items-center gap-3">
        <!-- Real-time subtotal -->
        <span class="text-xs font-mono text-neutral-500">
          Sous-total : <strong class="text-neutral-900 font-semibold text-sm">{{ lineTotal }} €</strong>
        </span>

        <button
          v-if="canRemove"
          type="button"
          @click="emit('remove', index)"
          class="text-neutral-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded transition-colors"
          title="Supprimer cette ligne"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Inputs Grid -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
      
      <!-- Description / Intitulé (Large) -->
      <div class="md:col-span-6">
        <label class="block text-xs font-medium text-neutral-700 mb-1">
          Désignation du composant / matériel <span class="text-rose-500">*</span>
        </label>
        <input
          v-model="item.description"
          type="text"
          placeholder="ex: STM32 Nucleo-64 F446RE, nRF52840 Dongle, Capteur LiDAR..."
          required
          class="w-full text-xs sm:text-sm px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black placeholder:text-neutral-400 bg-white"
        />
      </div>

      <!-- Fournisseur -->
      <div class="md:col-span-3">
        <label class="block text-xs font-medium text-neutral-700 mb-1">
          Fournisseur / Distributeur
        </label>
        <div class="relative">
          <input
            v-model="item.supplier"
            type="text"
            list="supplier-options"
            placeholder="Mouser, RS, Gotronic..."
            class="w-full text-xs sm:text-sm px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black placeholder:text-neutral-400 bg-white"
          />
          <datalist id="supplier-options">
            <option v-for="s in supplierSuggestions" :key="s" :value="s" />
          </datalist>
        </div>
      </div>

      <!-- Référence Fournisseur / Fabricant -->
      <div class="md:col-span-3">
        <label class="block text-xs font-medium text-neutral-700 mb-1 font-mono">
          Réf. Fournisseur / SKU
        </label>
        <input
          v-model="item.reference"
          type="text"
          placeholder="ex: NUCLEO-F446RE"
          class="w-full text-xs sm:text-sm font-mono px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black placeholder:text-neutral-400 bg-white"
        />
      </div>

      <!-- Lien Web Direct -->
      <div class="md:col-span-6">
        <div class="flex items-center justify-between mb-1">
          <label class="text-xs font-medium text-neutral-700">
            Lien web direct vers le produit <span class="text-rose-500">*</span>
          </label>
          <a
            v-if="item.url && isUrlValid"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-500 hover:text-black transition-colors"
          >
            <span>Tester lien</span>
            <ExternalLink class="w-3 h-3" />
          </a>
        </div>
        <input
          v-model="item.url"
          type="url"
          placeholder="https://www.mouser.fr/ProductDetail/..."
          required
          :class="[
            'w-full text-xs font-mono px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black placeholder:text-neutral-400 bg-white',
            !isUrlValid && item.url ? 'border-rose-300 text-rose-900 bg-rose-50/20' : 'border-neutral-200'
          ]"
        />
        <p v-if="!isUrlValid && item.url" class="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
          <AlertCircle class="w-3 h-3" />
          <span>Veuillez renseigner une URL valide commençant par http:// ou https://</span>
        </p>
      </div>

      <!-- Quantité -->
      <div class="md:col-span-3">
        <label class="block text-xs font-medium text-neutral-700 mb-1">
          Quantité <span class="text-rose-500">*</span>
        </label>
        <input
          v-model.number="item.quantity"
          type="number"
          min="1"
          step="1"
          required
          class="w-full text-xs sm:text-sm font-mono px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
        />
      </div>

      <!-- Prix unitaire TTC -->
      <div class="md:col-span-3">
        <label class="block text-xs font-medium text-neutral-700 mb-1">
          Prix unitaire estimé (€ TTC) <span class="text-rose-500">*</span>
        </label>
        <div class="relative">
          <input
            v-model.number="item.unitPrice"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="0.00"
            class="w-full text-xs sm:text-sm font-mono pr-8 pl-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
          />
          <span class="absolute right-3 top-2.5 text-xs text-neutral-400 font-mono">€</span>
        </div>
      </div>

    </div>

  </div>
</template>
