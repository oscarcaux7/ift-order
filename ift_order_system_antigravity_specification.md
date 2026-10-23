# IFT Order System — Antigravity Project Blueprint

> **Cible** : Spécification complète pour agent de développement (Antigravity).  
> **Objectif** : Générer une application web épurée, performante et autonome de gestion des demandes de commandes et matériel pour l'**Institute for Future Technologies (IFT)**.  
> **Stack** : Vue 3 (Composition API + `<script setup>`), Tailwind CSS, Firebase (Spark Tier gratuit : Auth + Firestore + Hosting).

---

## 1. Contexte & Vision

L'**Institute for Future Technologies (IFT)** (`https://ift.devinci.fr/`) est un laboratoire de recherche et d'expérimentation technologique à l'intersection de l'ingénierie, du design et des sciences computationnelles.

La page `/order` sert d'interface de commande interne pour :
1. **Les étudiants & chercheurs** : soumettre une demande d'achat de composants électroniques, capteurs, outillage, consommables ou matériel expérimental (Mouser, DigiKey, Amazon, RS Components, etc.) avec justification scientifique et projet associé.
2. **Les lab managers & encadrants** : valider, grouper, commander auprès du pôle achats et notifier la réception au laboratoire.

---

## 2. Design System & Identité Visuelle (Inspiré de ift.devinci.fr)

Le design doit être **minimaliste, aéré, typographique et fonctionnel** (style labo de recherche contemporain / Swiss modernist, à la manière du MIT Media Lab ou de l'IFT).

### 2.1 Couleurs & Thème
* **Fond principal** : Blanc cassé ultra-doux (`#FDFDFD` ou `bg-stone-50/50`)
* **Surfaces de carte** : Blanc pur (`#FFFFFF`), bordures nettes et fines (`border border-neutral-200`)
* **Texte principal** : Noir carbone (`#111111` ou `text-neutral-900`)
* **Texte secondaire / métadonnées** : Gris neutre (`#737373` ou `text-neutral-500`)
* **Accents fonctionnels (Statuts)** :
  * `En attente` : badge gris neutre (`bg-neutral-100 text-neutral-700 border-neutral-300`)
  * `Approuvé` : badge bleu subtil (`bg-sky-50 text-sky-700 border-sky-200`)
  * `Commandé` : badge ambre subtil (`bg-amber-50 text-amber-700 border-amber-200`)
  * `Disponible au labo` : badge émeraude (`bg-emerald-50 text-emerald-700 border-emerald-200`)
  * `Rejeté` : badge rose discret (`bg-rose-50 text-rose-700 border-rose-200`)

### 2.2 Typographie
* **Police d'interface** : Sans-serif géométrique ou néo-grotesque neutre (`Inter`, `system-ui`, `-apple-system`).
* **Micro-labels / tags / dates** : Police monospace (`JetBrains Mono`, `ui-monospace`, `Fira Code`) pour les références, prix, statuts et dates (`[2026-10-23]`, `REF-4819`).
* **Titres** : Bas de casse ou casse naturelle, tracking resserré (`tracking-tight`), poids `font-medium` ou `font-semibold` sans surcharge visuelle.

### 2.3 Éléments d'interface
* **Boutons** : Formes rectangulaires sobres avec un léger arrondi (`rounded-md`), contraste fort (noir plein `bg-black text-white hover:bg-neutral-800` ou contour net `border border-neutral-300 hover:border-black`).
* **Formulaires** : Champs épurés avec bordure fine, focus sans halo tapageur (`focus:ring-1 focus:ring-black focus:border-black`).
* **Hiérarchie visuelle** : Beaucoup d'espace négatif (`padding` généreux), listes tabulaires nettes et micro-interactions discrètes (transition douce d'opacité).

---

## 3. Architecture Technique

### 3.1 Frontend (Vue 3)
* **Build Tool** : Vite
* **Framework** : Vue 3 avec `<script setup lang="ts">` (ou JS moderne)
* **Router** : Vue Router 4 (routes : `/` formulaire de commande, `/orders` suivi et back-office, `/auth` connexion)
* **State** : Pinia pour la gestion d'état réactive (utilisateur connecté, liste des commandes actives)
* **Icones** : `lucide-vue-next` (icônes fines et universelles)

### 3.2 Backend (Firebase Free Spark Plan)
* **Firebase Auth** :
  * Authentification par Google (`@devinci.fr` restreint ou login email).
  * Mode invité ou connexion simplifiée pour soumettre un panier, rôle `admin`/`manager` via Firestore pour modifier les statuts.
* **Cloud Firestore** : Base NoSQL temps réel (écoute via `onSnapshot`).
* **Firebase Hosting** : Déploiement statique ultra-rapide en HTTPS.

---

## 4. Modèle de Données (Firestore Schema)

### Collection `orders`
Chaque document représente une demande d'achat :

```json
{
  "id": "ord_8f7b2c9a",
  "createdAt": "2026-10-23T13:20:00Z",
  "updatedAt": "2026-10-23T14:00:00Z",
  "applicant": {
    "name": "Oscar Caux",
    "email": "oscar.caux@devinci.fr",
    "role": "Student / Researcher"
  },
  "project": {
    "name": "Snake Eye RF",
    "code": "IFT-2026-RF"
  },
  "urgency": "normal", // "low" | "normal" | "urgent"
  "status": "pending", // "pending" | "approved" | "ordered" | "delivered" | "rejected"
  "statusNotes": "Commande groupée avec le batch RS Components de vendredi.",
  "items": [
    {
      "description": "Nordic Semiconductor nRF52840 USB Dongle",
      "url": "https://www.mouser.fr/ProductDetail/...",
      "supplier": "Mouser",
      "reference": "NRF52840-DONGLE",
      "quantity": 2,
      "unitPrice": 12.50,
      "currency": "EUR"
    }
  ],
  "totalEstimatedPrice": 25.00,
  "justification": "Nécessaire pour les tests de sniffing multi-interface du banc de test nomade."
}
```

### Collection `projects` (optionnelle / préremplie)
Liste indicative des projets et axes de l'IFT pour alimenter le sélecteur du formulaire :
* Nom du projet (`ReTouche`, `Snake Eye`, `Neural Landscapes`, `Bionic Prosthetics`, etc.)
* Responsable / référent de l'axe.

---

## 5. Fonctionnalités Requises

### 5.1 Formulaire de Demande (`/` ou `/order`)
1. **Informations Demandeur** : Nom, prénom, e-mail DeVinci, projet IFT associé.
2. **Liste dynamique d'articles** :
   * Ajout / suppression de lignes d'articles.
   * Champs par article : Description, Lien web marchand (URL directe), Référence fournisseur, Quantité, Prix unitaire estimé TTC.
   * Calcul automatique du total de la commande en temps réel.
3. **Justification** : Champ texte court précisant l'usage pour le projet.
4. **Validation UX** :
   * Feedback visuel immédiat après soumission.
   * Affichage d'un identifiant unique court (`#IFT-XXXX`) permettant de suivre la commande sans compte requis.

### 5.2 Vue Tableau de Bord & Suivi (`/orders`)
1. **Filtres rapides** : Par statut (`Tous`, `En attente`, `Approuvé`, `Commandé`, `Reçu au labo`), par projet ou par demandeur.
2. **Recherche instantanée** : Par nom, référence ou intitulé de composant.
3. **Export CSV** : Bouton permettant aux lab managers d'exporter les commandes validées dans un format tabulaire pour transmission directe au service achats de l'école.
4. **Mise à jour rapide des statuts** (mode administrateur/manager) :
   * Passer une commande de `En attente` à `Approuvé` ou `Commandé`.
   * Ajouter une note ou date de livraison estimée.

---

## 6. Règles de Sécurité Firestore (`firestore.rules`)

À déployer directement sans coût additionnel :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      // N'importe quel membre peut soumettre une commande et lire les statuts
      allow read, create: if true;
      // La mise à jour ou suppression est réservée aux utilisateurs authentifiés
      allow update, delete: if request.auth != null;
    }
    match /projects/{projectId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 7. Structure de Projet Recommandée

```text
ift-order/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── firebase.json
├── firestore.rules
└── src/
    ├── main.js
    ├── App.vue
    ├── firebase/
    │   └── config.js
    ├── router/
    │   └── index.js
    ├── stores/
    │   └── orderStore.js
    ├── components/
    │   ├── HeaderNav.vue
    │   ├── OrderForm.vue
    │   ├── OrderItemRow.vue
    │   ├── OrderTable.vue
    │   ├── StatusBadge.vue
    │   └── OrderDetailModal.vue
    └── views/
        ├── OrderCreateView.vue
        ├── OrderListView.vue
        └── LoginView.vue
```

---

## 8. Snippets de Configuration Clés

### 8.1 Configuration Firebase (`src/firebase/config.js`)
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### 8.2 Tailwind CSS (`tailwind.config.js`)
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ift: {
          dark: '#121212',
          card: '#FFFFFF',
          border: '#EAEAEA',
          subtle: '#F7F7F8'
        }
      }
    },
  },
  plugins: [],
}
```

---

## 9. Directives pour Antigravity

1. **Prioriser la clarté et l'absence de superflu** : Pas d'animations tape-à-l'œil. Des transitions fluides en fondu (`transition-opacity duration-150`).
2. **Zéro coût d'infrastructure** : Utiliser uniquement les fonctionnalités gratuites du SDK Firebase côté client (Auth, Firestore, Hosting) sans nécessiter de Cloud Functions payantes (Blaze).
3. **Formulaire robuste** : Prévoir des validations claires (URL valide pour les liens marchands, prix positifs, champs obligatoires bien indiqués).
4. **Responsive** : Parfaitement utilisable sur mobile comme sur grand écran d'atelier.