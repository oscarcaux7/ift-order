import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/firebase/config';

export const IFT_PROJECTS = [
  { name: 'Snake Eye RF', code: 'IFT-2026-RF', lead: 'Pôle Cyber-Physique' },
  { name: 'ReTouche', code: 'IFT-2026-RT', lead: 'Pôle Interaction & Haptique' },
  { name: 'Neural Landscapes', code: 'IFT-2026-NL', lead: 'Pôle BCI & Neurosciences' },
  { name: 'Bionic Prosthetics', code: 'IFT-2026-BP', lead: 'Pôle Mécatronique & Santé' },
  { name: 'Banc de Test Nomade', code: 'IFT-2026-BTN', lead: 'Instrumentation Électronique' },
  { name: 'Projet Libre / Recherche Personnelle', code: 'IFT-2026-GEN', lead: 'Lab Open Space' }
];

export const STATUS_MAP = {
  pending: { label: 'En attente', key: 'pending', badgeClass: 'bg-neutral-100 text-neutral-700 border-neutral-300' },
  approved: { label: 'Approuvé', key: 'approved', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200' },
  ordered: { label: 'Commandé', key: 'ordered', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  delivered: { label: 'Disponible au labo', key: 'delivered', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejeté', key: 'rejected', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' }
};

const INITIAL_DEMO_ORDERS = [
  {
    id: 'ord_demo_01',
    trackingCode: 'IFT-26-8F2A',
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    applicant: {
      name: 'Oscar Caux',
      email: 'oscar.caux@devinci.fr',
      role: 'Étudiant / Chercheur'
    },
    project: {
      name: 'Snake Eye RF',
      code: 'IFT-2026-RF'
    },
    urgency: 'urgent',
    status: 'approved',
    statusNotes: 'Validé par le Lab Manager. Commande groupée avec le batch Mouser de demain matin.',
    estimatedDeliveryDate: '2026-10-27',
    items: [
      {
        description: 'Nordic Semiconductor nRF52840 USB Dongle',
        url: 'https://www.mouser.fr/ProductDetail/Nordic-Semiconductor/nRF52840-Dongle?qs=1mbolxNpo8NqM4x%252B09HlMw%3D%3D',
        supplier: 'Mouser',
        reference: 'nRF52840-Dongle',
        quantity: 2,
        unitPrice: 12.80,
        currency: 'EUR'
      },
      {
        description: 'Antenne fouet omnidirectionnelle 2.4GHz SMA mâle 3dBi',
        url: 'https://fr.rs-online.com/web/p/antennes-rf/2246831',
        supplier: 'RS Components',
        reference: 'RS-224-6831',
        quantity: 4,
        unitPrice: 6.45,
        currency: 'EUR'
      }
    ],
    totalEstimatedPrice: 51.40,
    justification: 'Indispensable pour équiper le banc de test nomade de sniffing 802.15.4 / BLE et cartographier les interfaces sans-fil de l’atelier.'
  },
  {
    id: 'ord_demo_02',
    trackingCode: 'IFT-26-4C91',
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    applicant: {
      name: 'Camille Leroux',
      email: 'camille.leroux@devinci.fr',
      role: 'Doctorant'
    },
    project: {
      name: 'ReTouche',
      code: 'IFT-2026-RT'
    },
    urgency: 'normal',
    status: 'ordered',
    statusNotes: 'Commandé chez Mouser. N° suivi Colissimo : 9V0182749102.',
    estimatedDeliveryDate: '2026-10-25',
    items: [
      {
        description: 'Actionneur piézo-électrique haptique TDK PowerHap 2.5G',
        url: 'https://www.mouser.fr/ProductDetail/EPCOS-TDK/Z63000Z2910Z01Z01',
        supplier: 'Mouser',
        reference: 'Z63000Z2910Z1',
        quantity: 3,
        unitPrice: 34.20,
        currency: 'EUR'
      },
      {
        description: 'Driver Haptique DRV2605L breakout board',
        url: 'https://www.adafruit.com/product/2305',
        supplier: 'Adafruit / Gotronic',
        reference: 'AF-2305',
        quantity: 2,
        unitPrice: 11.50,
        currency: 'EUR'
      }
    ],
    totalEstimatedPrice: 125.60,
    justification: 'Tests d’intégration tactile ultra-rapide sur la surface tactile interactive ReTouche v2.'
  },
  {
    id: 'ord_demo_03',
    trackingCode: 'IFT-26-9B04',
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 16).toISOString(),
    applicant: {
      name: 'Alexandre Martin',
      email: 'alexandre.martin@devinci.fr',
      role: 'Enseignant-Chercheur'
    },
    project: {
      name: 'Neural Landscapes',
      code: 'IFT-2026-NL'
    },
    urgency: 'normal',
    status: 'delivered',
    statusNotes: 'Arrivé et déposé dans le casier BCI (Armoire Électronique A2). Prêt pour retrait.',
    estimatedDeliveryDate: '2026-10-22',
    items: [
      {
        description: 'Électrodes sèches Ag/AgCl pour casque EEG OpenBCI',
        url: 'https://shop.openbci.com/products/dry-eeg-electrodes',
        supplier: 'OpenBCI',
        reference: 'OBCI-ELECTRODE-8PK',
        quantity: 1,
        unitPrice: 89.00,
        currency: 'EUR'
      }
    ],
    totalEstimatedPrice: 89.00,
    justification: 'Remplacement des électrodes usagées pour la session d’enregistrement EEG prévue semaine prochaine.'
  },
  {
    id: 'ord_demo_04',
    trackingCode: 'IFT-26-1E77',
    createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    applicant: {
      name: 'Sophie Valin',
      email: 'sophie.valin@devinci.fr',
      role: 'Étudiant / Chercheur'
    },
    project: {
      name: 'Bionic Prosthetics',
      code: 'IFT-2026-BP'
    },
    urgency: 'urgent',
    status: 'pending',
    statusNotes: 'En cours de vérification de stock alternatif.',
    estimatedDeliveryDate: '',
    items: [
      {
        description: 'Servomoteur Numérique Dynamixel XL430-W250-T',
        url: 'https://www.robotis.fr/dynamixel-xl430-w250-t',
        supplier: 'Robotis / Génération Robots',
        reference: 'ROBOTIS-902-0131-000',
        quantity: 2,
        unitPrice: 62.00,
        currency: 'EUR'
      }
    ],
    totalEstimatedPrice: 124.00,
    justification: 'Articulations de phalanges motorisées pour le nouveau prototype d’avant-bras myoélectrique.'
  }
];

export const useOrderStore = defineStore('orders', () => {
  const orders = ref([]);
  const loading = ref(true);
  const error = ref(null);
  const activeFilter = ref('all');
  const searchQuery = ref('');
  const selectedProject = ref('all');

  // Load orders (from Firestore if configured, or from LocalStorage/Initial seed)
  const initStore = () => {
    if (isFirebaseConfigured && db) {
      loading.value = true;
      try {
        const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        onSnapshot(ordersQuery, (snapshot) => {
          orders.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // normalize dates
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : (doc.data().createdAt || new Date().toISOString()),
            updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate().toISOString() : (doc.data().updatedAt || new Date().toISOString())
          }));
          loading.value = false;
        }, (err) => {
          console.error('[IFT Order] Erreur Firestore:', err);
          error.value = err.message;
          fallbackToLocalStorage();
        });
      } catch (err) {
        console.error('[IFT Order] Exception Firestore:', err);
        fallbackToLocalStorage();
      }
    } else {
      fallbackToLocalStorage();
    }
  };

  const fallbackToLocalStorage = () => {
    try {
      const stored = localStorage.getItem('ift_local_orders');
      if (stored) {
        orders.value = JSON.parse(stored);
      } else {
        orders.value = INITIAL_DEMO_ORDERS;
        saveToLocalStorage();
      }
    } catch {
      orders.value = INITIAL_DEMO_ORDERS;
    }
    loading.value = false;
  };

  const saveToLocalStorage = () => {
    if (!isFirebaseConfigured) {
      localStorage.setItem('ift_local_orders', JSON.stringify(orders.value));
    }
  };

  const generateTrackingCode = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `IFT-${year}-${code}`;
  };

  // Create order
  const createOrder = async (orderPayload) => {
    const trackingCode = generateTrackingCode();
    const nowIso = new Date().toISOString();

    const newOrder = {
      trackingCode,
      createdAt: nowIso,
      updatedAt: nowIso,
      applicant: {
        name: orderPayload.applicant.name.trim(),
        email: orderPayload.applicant.email.trim().toLowerCase(),
        role: orderPayload.applicant.role || 'Étudiant / Chercheur'
      },
      project: {
        name: orderPayload.project.name,
        code: orderPayload.project.code || 'IFT-2026-GEN'
      },
      urgency: orderPayload.urgency || 'normal',
      status: 'pending',
      statusNotes: 'Demande enregistrée. En attente de révision par le Lab Manager.',
      estimatedDeliveryDate: '',
      items: orderPayload.items.map(item => ({
        description: item.description.trim(),
        url: item.url.trim(),
        supplier: item.supplier?.trim() || 'Non spécifié',
        reference: item.reference?.trim() || 'N/A',
        quantity: Math.max(1, parseInt(item.quantity) || 1),
        unitPrice: Math.max(0, parseFloat(item.unitPrice) || 0),
        currency: 'EUR'
      })),
      totalEstimatedPrice: orderPayload.items.reduce((sum, item) => {
        const q = Math.max(1, parseInt(item.quantity) || 1);
        const p = Math.max(0, parseFloat(item.unitPrice) || 0);
        return sum + (q * p);
      }, 0),
      justification: orderPayload.justification.trim()
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'orders'), {
          ...newOrder,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id, trackingCode };
      } catch (err) {
        console.error('[IFT Order] Échec enregistrement Firestore, bascule en local:', err);
      }
    }

    // Local / Demo mode handling
    const localId = `ord_loc_${Date.now()}`;
    const fullOrder = { id: localId, ...newOrder };
    orders.value.unshift(fullOrder);
    saveToLocalStorage();
    return { success: true, id: localId, trackingCode };
  };

  // Update order status
  const updateOrderStatus = async (orderId, status, notes = '', deliveryDate = null) => {
    const nowIso = new Date().toISOString();

    if (isFirebaseConfigured && db) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        const updates = {
          status,
          updatedAt: serverTimestamp()
        };
        if (notes !== undefined && notes !== null) updates.statusNotes = notes;
        if (deliveryDate !== undefined && deliveryDate !== null) updates.estimatedDeliveryDate = deliveryDate;

        await updateDoc(orderRef, updates);
        return { success: true };
      } catch (err) {
        console.error('[IFT Order] Erreur mise à jour Firestore:', err);
      }
    }

    // Local fallback
    const target = orders.value.find(o => o.id === orderId);
    if (target) {
      target.status = status;
      target.updatedAt = nowIso;
      if (notes !== undefined && notes !== null) target.statusNotes = notes;
      if (deliveryDate !== undefined && deliveryDate !== null) target.estimatedDeliveryDate = deliveryDate;
      saveToLocalStorage();
      return { success: true };
    }
    return { success: false, error: 'Commande non trouvée' };
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
        return { success: true };
      } catch (err) {
        console.error('[IFT Order] Erreur suppression Firestore:', err);
      }
    }

    orders.value = orders.value.filter(o => o.id !== orderId);
    saveToLocalStorage();
    return { success: true };
  };

  // Export to CSV for school procurement
  const exportOrdersCSV = (ordersToExport = null) => {
    const list = ordersToExport || filteredOrders.value;
    if (!list.length) return false;

    const headers = [
      'Référence Commande',
      'Date Création',
      'Demandeur',
      'Email DeVinci',
      'Rôle Demandeur',
      'Projet IFT',
      'Code Projet',
      'Urgence',
      'Statut',
      'Total Estimé (€ TTC)',
      'Articles (Détail)',
      'Justification Scientifique',
      'Notes Lab Manager',
      'Date Livraison Estimée'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = list.map(o => {
      const itemsDetail = o.items.map(it => 
        `[${it.supplier || 'N/A'}] ${it.description} (Réf: ${it.reference || 'N/A'}, Qté: ${it.quantity}, PU: ${Number(it.unitPrice).toFixed(2)}€) -> ${it.url}`
      ).join(' | ');

      const statusLabel = STATUS_MAP[o.status]?.label || o.status;

      return [
        escapeCsv(o.trackingCode || o.id),
        escapeCsv(new Date(o.createdAt).toLocaleDateString('fr-FR')),
        escapeCsv(o.applicant?.name),
        escapeCsv(o.applicant?.email),
        escapeCsv(o.applicant?.role),
        escapeCsv(o.project?.name),
        escapeCsv(o.project?.code),
        escapeCsv(o.urgency),
        escapeCsv(statusLabel),
        escapeCsv(Number(o.totalEstimatedPrice || 0).toFixed(2)),
        escapeCsv(itemsDetail),
        escapeCsv(o.justification),
        escapeCsv(o.statusNotes || ''),
        escapeCsv(o.estimatedDeliveryDate || '')
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `IFT_Commandes_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  };

  // Filtered orders computed
  const filteredOrders = computed(() => {
    return orders.value.filter(order => {
      // Status filter
      if (activeFilter.value !== 'all' && order.status !== activeFilter.value) {
        return false;
      }
      // Project filter
      if (selectedProject.value !== 'all' && order.project?.name !== selectedProject.value) {
        return false;
      }
      // Search query
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim();
        const codeMatch = order.trackingCode?.toLowerCase().includes(q) || order.id?.toLowerCase().includes(q);
        const nameMatch = order.applicant?.name?.toLowerCase().includes(q);
        const emailMatch = order.applicant?.email?.toLowerCase().includes(q);
        const projectMatch = order.project?.name?.toLowerCase().includes(q) || order.project?.code?.toLowerCase().includes(q);
        const itemMatch = order.items?.some(it => 
          it.description?.toLowerCase().includes(q) || 
          it.reference?.toLowerCase().includes(q) ||
          it.supplier?.toLowerCase().includes(q)
        );
        return codeMatch || nameMatch || emailMatch || projectMatch || itemMatch;
      }
      return true;
    });
  });

  // Status counts
  const counts = computed(() => {
    const res = {
      all: orders.value.length,
      pending: 0,
      approved: 0,
      ordered: 0,
      delivered: 0,
      rejected: 0
    };
    for (const o of orders.value) {
      if (res[o.status] !== undefined) {
        res[o.status]++;
      }
    }
    return res;
  });

  // Total amount computed
  const totalAmount = computed(() => {
    return orders.value.reduce((sum, o) => sum + (Number(o.totalEstimatedPrice) || 0), 0);
  });

  return {
    orders,
    loading,
    error,
    activeFilter,
    searchQuery,
    selectedProject,
    filteredOrders,
    counts,
    totalAmount,
    initStore,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    exportOrdersCSV
  };
});
