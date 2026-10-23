<script setup>
import { ref, reactive, computed } from 'vue';
import { useOrderStore, IFT_PROJECTS } from '@/stores/orderStore';
import OrderItemRow from '@/components/OrderItemRow.vue';
import SuccessBannerModal from '@/components/SuccessBannerModal.vue';
import { 
  Plus, 
  Send, 
  AlertCircle, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  HelpCircle,
  Clock
} from 'lucide-vue-next';

const orderStore = useOrderStore();

const rolesList = [
  'Étudiant / Chercheur',
  'Doctorant',
  'Enseignant-Chercheur',
  'Lab Tech / FabManager',
  'Stagiaire de Recherche',
  'Autre'
];

const form = reactive({
  applicant: {
    name: '',
    email: '',
    role: 'Étudiant / Chercheur'
  },
  project: {
    name: IFT_PROJECTS[0].name,
    code: IFT_PROJECTS[0].code
  },
  customProjectName: '',
  urgency: 'normal',
  justification: '',
  items: [
    {
      description: '',
      url: '',
      supplier: 'Mouser',
      reference: '',
      quantity: 1,
      unitPrice: 0.00
    }
  ]
});

const isSubmitting = ref(false);
const errorMessage = ref('');
const isSuccessOpen = ref(false);
const submittedOrderData = ref({});

const onProjectChange = () => {
  if (form.project.name === 'custom') {
    form.project.code = 'IFT-2026-CUSTOM';
  } else {
    const found = IFT_PROJECTS.find(p => p.name === form.project.name);
    if (found) {
      form.project.code = found.code;
    }
  }
};

const addItem = () => {
  form.items.push({
    description: '',
    url: '',
    supplier: '',
    reference: '',
    quantity: 1,
    unitPrice: 0.00
  });
};

const removeItem = (idx) => {
  if (form.items.length > 1) {
    form.items.splice(idx, 1);
  }
};

const totalEstimated = computed(() => {
  return form.items.reduce((sum, it) => {
    const q = Number(it.quantity) || 0;
    const p = Number(it.unitPrice) || 0;
    return sum + (q * p);
  }, 0);
});

const totalItemsCount = computed(() => {
  return form.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
});

const validateForm = () => {
  if (!form.applicant.name.trim()) {
    return 'Veuillez saisir votre nom et prénom.';
  }
  if (!form.applicant.email.trim() || !form.applicant.email.includes('@')) {
    return 'Veuillez renseigner une adresse email valide.';
  }
  if (form.project.name === 'custom' && !form.customProjectName.trim()) {
    return 'Veuillez préciser l’intitulé de votre projet personnalisé.';
  }
  if (!form.items.length) {
    return 'Votre commande doit comporter au moins un article.';
  }
  for (let i = 0; i < form.items.length; i++) {
    const it = form.items[i];
    if (!it.description.trim()) {
      return `L'article #${i + 1} n'a pas de désignation.`;
    }
    if (!it.url.trim()) {
      return `L'article #${i + 1} nécessite un lien direct vers la fiche marchand.`;
    }
    try {
      new URL(it.url);
    } catch {
      return `L'URL de l'article #${i + 1} est invalide (ex: https://...).`;
    }
    if (Number(it.quantity) <= 0) {
      return `La quantité de l'article #${i + 1} doit être d'au moins 1.`;
    }
    if (Number(it.unitPrice) < 0) {
      return `Le prix unitaire de l'article #${i + 1} ne peut être négatif.`;
    }
  }
  if (!form.justification.trim() || form.justification.trim().length < 10) {
    return 'Veuillez rédiger une justification succincte (au moins 10 caractères) expliquant l’usage du matériel.';
  }
  return null;
};

const handleSubmit = async () => {
  errorMessage.value = '';
  const validationError = validateForm();
  if (validationError) {
    errorMessage.value = validationError;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  isSubmitting.value = true;

  try {
    const finalProjectName = form.project.name === 'custom' 
      ? form.customProjectName.trim() 
      : form.project.name;

    const payload = {
      applicant: {
        name: form.applicant.name,
        email: form.applicant.email,
        role: form.applicant.role
      },
      project: {
        name: finalProjectName,
        code: form.project.code
      },
      urgency: form.urgency,
      justification: form.justification,
      items: form.items
    };

    const result = await orderStore.createOrder(payload);

    if (result.success) {
      submittedOrderData.value = {
        trackingCode: result.trackingCode,
        projectName: finalProjectName,
        applicantName: form.applicant.name,
        applicantEmail: form.applicant.email,
        itemCount: totalItemsCount.value,
        totalEstimatedPrice: totalEstimated.value
      };
      isSuccessOpen.value = true;
      resetForm();
    } else {
      errorMessage.value = "Une erreur est survenue lors de l'enregistrement de votre commande.";
    }
  } catch (err) {
    console.error(err);
    errorMessage.value = "Erreur inattendue : " + err.message;
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  form.items = [
    {
      description: '',
      url: '',
      supplier: 'Mouser',
      reference: '',
      quantity: 1,
      unitPrice: 0.00
    }
  ];
  form.justification = '';
  form.customProjectName = '';
  form.urgency = 'normal';
};
</script>

<template>
  <div class="max-w-4xl mx-auto">

    <!-- Error Alert if any -->
    <div
      v-if="errorMessage"
      class="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3"
    >
      <AlertCircle class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
      <div>
        <p class="font-semibold">Attention : formulaire incomplet</p>
        <p class="mt-0.5">{{ errorMessage }}</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-8">

      <!-- Section 1 : Demandeur & Projet -->
      <div class="bg-white border border-neutral-200 rounded-xl p-5 sm:p-7 shadow-xs">
        <div class="border-b border-neutral-100 pb-3 mb-5 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold uppercase tracking-wider font-mono text-neutral-900">
              1. Informations Demandeur & Projet IFT
            </h2>
            <p class="text-xs text-neutral-500 mt-0.5">Identité du porteur et rattachement de la commande</p>
          </div>
          <span class="text-[11px] font-mono text-neutral-400">Section 1/3</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <!-- Nom & Prénom -->
          <div>
            <label class="block text-xs font-medium text-neutral-700 mb-1">
              Nom et Prénom <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.applicant.name"
              type="text"
              required
              placeholder="ex: Oscar Caux"
              class="w-full text-xs sm:text-sm px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
            />
          </div>

          <!-- Email DeVinci -->
          <div>
            <label class="block text-xs font-medium text-neutral-700 mb-1">
              E-mail académique DeVinci <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.applicant.email"
              type="email"
              required
              placeholder="prenom.nom@devinci.fr"
              class="w-full text-xs sm:text-sm px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
            />
            <p class="mt-1 text-[11px] text-neutral-400">
              Les notifications de livraison et validation seront adressées à cette boîte.
            </p>
          </div>

          <!-- Rôle -->
          <div>
            <label class="block text-xs font-medium text-neutral-700 mb-1">
              Statut / Rôle au laboratoire
            </label>
            <select
              v-model="form.applicant.role"
              class="w-full text-xs sm:text-sm px-3 py-2 border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            >
              <option v-for="r in rolesList" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>

          <!-- Projet IFT -->
          <div>
            <label class="block text-xs font-medium text-neutral-700 mb-1">
              Axe de recherche / Projet IFT <span class="text-rose-500">*</span>
            </label>
            <select
              v-model="form.project.name"
              @change="onProjectChange"
              class="w-full text-xs sm:text-sm px-3 py-2 border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            >
              <option v-for="p in IFT_PROJECTS" :key="p.code" :value="p.name">
                {{ p.name }} ({{ p.code }})
              </option>
              <option value="custom">Autre axe / Projet personnalisé...</option>
            </select>
          </div>

          <!-- Custom project input -->
          <div v-if="form.project.name === 'custom'" class="sm:col-span-2">
            <label class="block text-xs font-medium text-neutral-700 mb-1">
              Intitulé précis de votre projet ou sujet <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.customProjectName"
              type="text"
              required
              placeholder="ex: Prototype drone bio-inspiré autonome"
              class="w-full text-xs sm:text-sm px-3 py-2 border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
          </div>

          <!-- Niveau d'urgence -->
          <div class="sm:col-span-2 pt-2 border-t border-neutral-100">
            <label class="block text-xs font-medium text-neutral-700 mb-2">
              Degré d'urgence de la demande
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                :class="[
                  'flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all text-xs',
                  form.urgency === 'normal' ? 'border-neutral-900 bg-neutral-50/70 font-medium' : 'border-neutral-200 hover:border-neutral-300'
                ]"
              >
                <input type="radio" v-model="form.urgency" value="normal" class="text-black focus:ring-0" />
                <div>
                  <div class="font-semibold text-neutral-900">Normal (Délai standard)</div>
                  <div class="text-[11px] text-neutral-500">Groupage hebdomadaire</div>
                </div>
              </label>

              <label
                :class="[
                  'flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all text-xs',
                  form.urgency === 'urgent' ? 'border-neutral-900 bg-neutral-50/70 font-medium' : 'border-neutral-200 hover:border-neutral-300'
                ]"
              >
                <input type="radio" v-model="form.urgency" value="urgent" class="text-black focus:ring-0" />
                <div>
                  <div class="font-semibold text-rose-700">Urgent (Bloquant)</div>
                  <div class="text-[11px] text-neutral-500">Banc de test à l'arrêt</div>
                </div>
              </label>

              <label
                :class="[
                  'flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all text-xs',
                  form.urgency === 'low' ? 'border-neutral-900 bg-neutral-50/70 font-medium' : 'border-neutral-200 hover:border-neutral-300'
                ]"
              >
                <input type="radio" v-model="form.urgency" value="low" class="text-black focus:ring-0" />
                <div>
                  <div class="font-semibold text-neutral-700">Stock prévisionnel</div>
                  <div class="text-[11px] text-neutral-500">Consommables à reconstituer</div>
                </div>
              </label>
            </div>
          </div>

        </div>
      </div>

      <!-- Section 2 : Liste des articles -->
      <div class="bg-white border border-neutral-200 rounded-xl p-5 sm:p-7 shadow-xs">
        <div class="border-b border-neutral-100 pb-3 mb-5 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold uppercase tracking-wider font-mono text-neutral-900">
              2. Matériel & Composants à commander
            </h2>
            <p class="text-xs text-neutral-500 mt-0.5">Spécifiez les références précises et les liens marchands directs</p>
          </div>
          <span class="text-[11px] font-mono text-neutral-400">Section 2/3</span>
        </div>

        <div class="space-y-4">
          <OrderItemRow
            v-for="(item, idx) in form.items"
            :key="idx"
            :item="item"
            :index="idx"
            :can-remove="form.items.length > 1"
            @remove="removeItem"
          />
        </div>

        <!-- Add Item Button & Summary -->
        <div class="mt-5 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <button
            type="button"
            @click="addItem"
            class="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
          >
            <Plus class="w-4 h-4" />
            <span>Ajouter une autre référence</span>
          </button>

          <!-- Real-time Order Total Badge -->
          <div class="flex items-center justify-between sm:justify-end gap-4 bg-neutral-50 px-4 py-2 rounded-lg border border-neutral-200">
            <span class="text-xs font-mono text-neutral-500">
              Total estimé ({{ totalItemsCount }} unité{{ totalItemsCount > 1 ? 's' : '' }}) :
            </span>
            <span class="text-base font-mono font-bold text-neutral-900">
              {{ totalEstimated.toFixed(2) }} € TTC
            </span>
          </div>
        </div>

      </div>

      <!-- Section 3 : Justification Scientifique -->
      <div class="bg-white border border-neutral-200 rounded-xl p-5 sm:p-7 shadow-xs">
        <div class="border-b border-neutral-100 pb-3 mb-5 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold uppercase tracking-wider font-mono text-neutral-900">
              3. Justification Scientifique & Pédagogique
            </h2>
            <p class="text-xs text-neutral-500 mt-0.5">Expliquez brièvement la finalité de cette commande dans le cadre des activités du laboratoire</p>
          </div>
          <span class="text-[11px] font-mono text-neutral-400">Section 3/3</span>
        </div>

        <div>
          <label class="block text-xs font-medium text-neutral-700 mb-1.5">
            Argumentaire d'achat <span class="text-rose-500">*</span>
          </label>
          <textarea
            v-model="form.justification"
            required
            rows="3"
            placeholder="ex: Ces composants RF et antennes sont nécessaires pour étalonner la réception multi-bande du banc de test Snake Eye. Pas d'équivalent disponible dans le stock actuel du labo."
            class="w-full text-xs sm:text-sm px-3 py-2.5 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white placeholder:text-neutral-400"
          ></textarea>
          <div class="flex items-center justify-between mt-1 text-[11px] text-neutral-400 font-mono">
            <span>Minimum recommandé : 1-2 phrases explicatives.</span>
            <span>{{ form.justification.length }} caractères</span>
          </div>
        </div>

        <!-- Practical Lab Notice -->
        <div class="mt-5 p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 flex items-start gap-3">
          <Info class="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
          <div class="text-xs text-neutral-600 space-y-1">
            <p class="font-medium text-neutral-800">Processus de validation à l'IFT :</p>
            <p>
              Les commandes sont examinées par les Lab Managers (validation technique) avant transmission au service Achats de DeVinci. Dès réception dans les casiers du labo, le statut de votre commande passera à <span class="font-semibold text-emerald-700">« Disponible au labo »</span>.
            </p>
          </div>
        </div>
      </div>

      <!-- Submit Action Bar -->
      <div class="flex items-center justify-between pt-2">
        <button
          type="button"
          @click="resetForm"
          class="text-xs text-neutral-500 hover:text-neutral-900 px-3 py-2 transition-colors"
        >
          Réinitialiser le formulaire
        </button>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-neutral-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send v-if="!isSubmitting" class="w-4 h-4" />
          <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>{{ isSubmitting ? 'Envoi en cours...' : 'Soumettre la demande d’achat' }}</span>
        </button>
      </div>

    </form>

    <!-- Success Modal -->
    <SuccessBannerModal
      :is-open="isSuccessOpen"
      :order-summary="submittedOrderData"
      @close="isSuccessOpen = false"
      @new-order="isSuccessOpen = false"
    />

  </div>
</template>
