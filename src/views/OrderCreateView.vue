<script setup>
import OrderForm from '@/components/OrderForm.vue';
import { 
  Zap, 
  ShieldCheck, 
  Clock, 
  HelpCircle, 
  Layers, 
  Building2 
} from 'lucide-vue-next';
</script>

<template>
  <div class="py-8 sm:py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      
      <!-- Lab Introduction Header -->
      <div class="mb-8 sm:mb-10 text-center sm:text-left">
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-mono mb-3">
          <span class="w-2 h-2 rounded-full bg-neutral-900"></span>
          <span>IFT // LABORATORY PROCUREMENT</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
          Demande d'achat de matériel & composants
        </h1>
        <p class="mt-2 text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed">
          Formulaire réservé aux projets de recherche, travaux pratiques avancés et expérimentations de l'Institute for Future Technologies (DeVinci).
        </p>

        <!-- Quick Info Badges -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-neutral-200/70">
          <div class="flex items-start gap-3 p-3 rounded-lg bg-white border border-neutral-200">
            <Clock class="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
            <div>
              <p class="text-xs font-semibold text-neutral-900">Validation bi-hebdomadaire</p>
              <p class="text-[11px] text-neutral-500">Mardi & Jeudi à 11h par les Lab Managers</p>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 rounded-lg bg-white border border-neutral-200">
            <Building2 class="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
            <div>
              <p class="text-xs font-semibold text-neutral-900">Fournisseurs Référencés</p>
              <p class="text-[11px] text-neutral-500">Mouser, RS Components, DigiKey, Farnell</p>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 rounded-lg bg-white border border-neutral-200">
            <ShieldCheck class="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
            <div>
              <p class="text-xs font-semibold text-neutral-900">Suivi Simplifié</p>
              <p class="text-[11px] text-neutral-500">Numéro de suivi unique sans mot de passe</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Form -->
      <OrderForm />

    </div>
  </div>
</template>
