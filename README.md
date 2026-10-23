# IFT Order System — Institute for Future Technologies

[![GitHub Pages](https://img.shields.io/badge/Demo-GitHub%20Pages-black?style=flat&logo=github)](https://oscarcaux7.github.io/ift-order/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?style=flat&logo=vuedotjs)](https://vuejs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

> 🌐 **Site en direct sur GitHub Pages** : **[https://oscarcaux7.github.io/ift-order/](https://oscarcaux7.github.io/ift-order/)**  
> 📁 **Dépôt GitHub** : **[https://github.com/oscarcaux7/ift-order](https://github.com/oscarcaux7/ift-order)**

Système de gestion et de suivi des demandes d'achats de matériel, composants électroniques et consommables de laboratoire pour l'**Institute for Future Technologies (IFT)** ([ift.devinci.fr](https://ift.devinci.fr)).

Conçu avec une identité visuelle minimaliste, aérée et fonctionnelle (Swiss Modernist / labo de recherche contemporain), optimisé pour le **Spark Tier gratuit de Firebase** (zéro coût d'infrastructure).

---

## 🚀 Fonctionnalités Clés

### 1. Formulaire de Réquisition (`/`)
* **Informations demandeur** : Nom, prénom, e-mail académique DeVinci, rôle (Étudiant, Doctorant, Enseignant-Chercheur, Lab Tech).
* **Sélection du projet IFT** : Projets préconfigurés (*Snake Eye RF*, *ReTouche*, *Neural Landscapes*, *Bionic Prosthetics*, *Banc de Test Nomade*) ou projet libre personnalisé.
* **Degré d'urgence** : Normal (délai standard), Urgent (bloquant pour manipulation), Stock prévisionnel.
* **Lignes d'articles dynamiques** :
  * Désignation du composant
  * Lien web direct marchand (Mouser, DigiKey, RS Components, Farnell, Amazon, Gotronic, etc.) avec validation d'URL
  * Fournisseur & Référence fabricant / SKU
  * Quantité et prix unitaire estimé TTC
  * Calcul automatique en temps réel des sous-totaux et du montant global de la réquisition
* **Justification scientifique** : Argumentaire d'achat pour validation par les encadrants
* **Feedback immédiat & code de suivi** : Génération d'une référence unique (ex: `#IFT-26-8F2A`) permettant à l'étudiant de suivre l'avancement sans obligation de créer un compte.

### 2. Tableau de Bord & Suivi des Commandes (`/orders`)
* **Filtrage instantané par statut** avec compteurs en temps réel :
  * `Tous`
  * `En attente`
  * `Approuvé`
  * `Commandé`
  * `Disponible au labo`
  * `Rejeté`
* **Recherche temps réel** : Par numéro de suivi, nom du demandeur, projet, mot-clé ou référence fournisseur.
* **Filtre par projet IFT** : Tri sélectif par axe de recherche.
* **Fiche détaillée interactive (Modal)** : Consultation intégrale de la réquisition, liens marchands cliquables, chronologie et notes internes.
* **Export CSV Pôle Achats** : Génération d'un export tabulaire UTF-8 avec séparateur point-virgule compatible avec Microsoft Excel et Google Sheets.

### 3. Espace Lab Manager & Administration (`/auth`)
* **Connexion simplifiée** : Google Auth (`@devinci.fr`) ou e-mail/mot de passe via Firebase Auth.
* **Mode Démo instantané (1-Clic)** : Possibilité de basculer en rôle *Lab Manager* immédiatement pour tester les fonctions d'arbitrage sans configuration préalable.
* **Contrôles administrateur** :
  * Modification des statuts d'une commande
  * Ajout de notes de suivi (ex: *Numéro de suivi Colissimo*, *groupage Mouser de vendredi*)
  * Définition d'une date estimée de réception au laboratoire
  * Suppression de commande

---

## 🛠️ Stack Technique

* **Framework** : [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`)
* **Build Tool** : [Vite 6](https://vitejs.dev/)
* **State Management** : [Pinia 3](https://pinia.vuejs.org/)
* **Routing** : [Vue Router 4](https://router.vuejs.org/)
* **CSS** : [Tailwind CSS 3](https://tailwindcss.com/)
* **Iconographie** : [lucide-vue-next](https://lucide.dev/)
* **Backend Cloud (Serverless gratuit)** :
  * **Firebase Auth** (Google / Email)
  * **Cloud Firestore** (NoSQL temps réel via `onSnapshot`)
  * **Firebase Hosting** (Hébergement statique HTTPS haute disponibilité)

---

## 💻 Démarrage Rapide

### Prérequis
* Node.js >= 18 (testé sous Node 22)
* npm >= 9

### Installation
```bash
# Cloner le dépôt et entrer dans le dossier
cd IFT_ORDER

# Installer les dépendances
npm install
```

### Lancement en Développement
```bash
npm run dev
```
L'application démarre par défaut sur `http://localhost:5173`.

> **Note sur le mode démo / local** :  
> Si les variables d'environnement Firebase ne sont pas encore définies, l'application fonctionne immédiatement en mode hors-ligne / démo avec un jeu de commandes réalistes préchargées dans le `localStorage`. Vous pouvez créer, filtrer, mettre à jour les statuts et exporter en CSV sans aucune manipulation préalable !

### Build de Production
```bash
npm run build
```
Les fichiers statiques optimisés sont générés dans le dossier `dist/`.

---

## ☁️ Configuration Firebase (Spark Tier Gratuit)

Pour connecter l'application à un projet Firebase réel :

1. Rendez-vous sur la [Console Firebase](https://console.firebase.google.com/) et créez un projet (gratuit Spark).
2. Activez **Cloud Firestore** en mode production.
3. Activez **Authentication** :
   * Fournisseur *Google* (en configurant le domaine autorisé `devinci.fr`).
   * Fournisseur *Adresse e-mail/Mot de passe*.
4. Récupérez les identifiants Web de votre application Firebase (`Project settings` -> `General` -> `Your apps`).
5. Créez un fichier `.env` à la racine en copiant `.env.example` :

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
```

### Déploiement des Règles Firestore
Les règles de sécurité Firestore sont prêtes dans `firestore.rules` :
* Lecture et création publiques (n'importe quel membre peut commander et consulter le statut).
* Modification et suppression restreintes aux utilisateurs authentifiés (`request.auth != null`).

Déployez avec la CLI Firebase :
```bash
firebase deploy --only firestore:rules
```

### Déploiement sur Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

---

## 🎨 Charte Graphique & Identité Visuelle

* **Fond principal** : Blanc cassé moderne `#FBFBFC`
* **Cartes & Surfaces** : Blanc `#FFFFFF` avec bordures ultra-fines `border-neutral-200`
* **Typographie** : `Inter` pour les interfaces, `JetBrains Mono` pour les codes de suivi, dates, prix et références techniques.
* **Palette des Statuts** :
  * **En attente** : Gris neutre (`bg-neutral-100 text-neutral-700 border-neutral-300`)
  * **Approuvé** : Bleu subtil (`bg-sky-50 text-sky-700 border-sky-200`)
  * **Commandé** : Ambre subtil (`bg-amber-50 text-amber-700 border-amber-200`)
  * **Disponible au labo** : Émeraude (`bg-emerald-50 text-emerald-700 border-emerald-200`)
  * **Rejeté** : Rose discret (`bg-rose-50 text-rose-700 border-rose-200`)

---

## 📁 Structure du Projet

```text
IFT_ORDER/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── firebase.json
├── firestore.rules
├── .env.example
├── README.md
└── src/
    ├── main.js
    ├── App.vue
    ├── assets/
    │   └── main.css
    ├── firebase/
    │   └── config.js
    ├── router/
    │   └── index.js
    ├── stores/
    │   ├── authStore.js
    │   └── orderStore.js
    ├── components/
    │   ├── HeaderNav.vue
    │   ├── OrderForm.vue
    │   ├── OrderItemRow.vue
    │   ├── OrderTable.vue
    │   ├── StatusBadge.vue
    │   ├── OrderDetailModal.vue
    │   └── SuccessBannerModal.vue
    └── views/
        ├── OrderCreateView.vue
        ├── OrderListView.vue
        └── LoginView.vue
```

---

© 2026 Institute for Future Technologies — Pôle Léonard de Vinci.
