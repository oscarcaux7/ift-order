import { createRouter, createWebHistory } from 'vue-router';
import OrderCreateView from '@/views/OrderCreateView.vue';
import OrderListView from '@/views/OrderListView.vue';
import LoginView from '@/views/LoginView.vue';

const routes = [
  {
    path: '/',
    name: 'order-create',
    component: OrderCreateView,
    meta: { title: 'Nouvelle Demande — IFT Order' }
  },
  {
    path: '/orders',
    name: 'order-list',
    component: OrderListView,
    meta: { title: 'Suivi & Commandes — IFT Order' }
  },
  {
    path: '/auth',
    name: 'auth',
    component: LoginView,
    meta: { title: 'Connexion Espace Lab Manager — IFT Order' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach((to) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
});

export default router;
