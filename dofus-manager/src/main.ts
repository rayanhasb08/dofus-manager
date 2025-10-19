import Alpine from 'alpinejs';
import { router } from './router';
import { ApiService } from './services/ApiService';
import { ItemStore } from './stores/ItemStore';
import { createItemsPage } from './components/ItemPage';
import { createStatsPage } from './components/StatsPage';
import { createSettingsPage } from './components/SettingsPage';  // ← AJOUT
import { RouteConfig } from './router/types';
import './style.css';

// Initialisation
const apiService = new ApiService();
const itemStore = new ItemStore(apiService);

// Alpine Component: App Principal avec Router
Alpine.data('app', () => ({
  currentRoute: null as RouteConfig | null,
  routes: router.getRoutes(),
  mobileMenuOpen: false,

  init() {
    window.addEventListener('route-changed', (e: any) => {
      this.currentRoute = e.detail.route;
      this.mobileMenuOpen = false;
    });
    this.currentRoute = router.getCurrentRoute();
  },

  navigate(path: string) {
    router.navigate(path);
  }
}));

// Alpine Component: Gestion des Items
Alpine.data('itemManager', () => createItemsPage(itemStore));

// Alpine Component: Page des Statistiques
Alpine.data('statsPage', () => createStatsPage(itemStore));

// Alpine Component: Page des Paramètres  ← AJOUT
Alpine.data('settingsPage', () => createSettingsPage());

// Start Alpine
Alpine.start();

// Make Alpine and Router available globally
(window as any).Alpine = Alpine;
(window as any).router = router;

console.log('Alpine started with router, version:', Alpine.version);