import { ItemStore } from '../../stores/ItemStore';
import {
  formatKamas,
  formatPercent,
  getDifficultyBadgeClass,
  getDifficultyColor,
  getRankColor
} from '../shared/utils';
import {
  getDifficultyStats,
  getProfitableCount,
  getSuccessRate,
  getAverageCostPerItem,
  getAverageProfitPerItem,
  getTopItemsByProfit,
  getTopItemsByYield,
  formatProfitPercent
} from './utils';

// Import des templates HTML
import emptyStateTemplate from './templates/empty-state.html?raw';
import statCardsTemplate from './templates/stat-cards.html?raw';
import detailedStatsTemplate from './templates/detailed-stats.html?raw';
import extremeItemsTemplate from './templates/extreme-items.html?raw';
import topItemsProfitTemplate from './templates/top-items-profit.html?raw';
import topItemsYieldTemplate from './templates/top-items-yield.html?raw';

/**
 * Composant Alpine.js pour la page de statistiques
 */
export function createStatsPage(itemStore: ItemStore) {
  return {
    store: itemStore,

    async init() {
      console.log('StatsPage initialized');
      await this.store.loadData();
    },

    // Getters
    get stats() {
      return this.store.getStats();
    },

    get items() {
      return this.store.getAllItemsWithoutFilter();
    },

    get loading() {
      return this.store.isLoading();
    },

    // Computed properties pour les stats détaillées
    get difficultyStats() {
      return getDifficultyStats(this.items);
    },

    get profitableCount() {
      return getProfitableCount(this.items, true);
    },

    get unprofitableCount() {
      return getProfitableCount(this.items, false);
    },

    get successRate() {
      return getSuccessRate(this.items);
    },

    get averageCostPerItem() {
      return getAverageCostPerItem(this.items);
    },

    get averageProfitPerItem() {
      return getAverageProfitPerItem(this.items);
    },

    get averageInvestment() {
      const stats = this.stats;
      if (!stats || stats.totalItems === 0) return 0;
      return stats.totalInvestment / stats.totalItems;
    },

    get topItemsByProfit() {
      return getTopItemsByProfit(this.items, 10);
    },

    get topItemsByYield() {
      return getTopItemsByYield(this.items, 10);
    },

    // Contenu de la page
    get statsPageContent() {
      const stats = this.stats;
      const items = this.items;

      // Loading
      if (this.loading) {
        return '<div class="loading-state"><div class="spinner"></div></div>';
      }

      // État vide
      if (!stats || items.length === 0) {
        return emptyStateTemplate;
      }

      // Page normale avec stats
      return this.buildStatsPage();
    },

    // Construction de la page complète
    buildStatsPage() {
      return `
        <div class="stats-page-container">
          
          <!-- En-tête -->
          <div class="stats-page-header">
            <div>
              <h2 class="stats-page-title">Statistiques Globales</h2>
              <p class="stats-page-subtitle">Analyse complète de vos activités de craft & forgemagie</p>
            </div>
            <button onclick="window.router.navigate('/items')" class="btn btn-secondary">
              ← Retour aux items
            </button>
          </div>

          <!-- Stats Principales -->
          ${statCardsTemplate}

          <!-- Stats Avancées -->
          ${detailedStatsTemplate}

          <!-- Items Extrêmes -->
          ${extremeItemsTemplate}

          <!-- Top 10 Items par Bénéfice -->
          ${topItemsProfitTemplate}

          <!-- Top 10 Items par Rendement -->
          ${topItemsYieldTemplate}

        </div>
      `;
    },

    // Méthodes utilitaires (disponibles dans les templates)
    formatKamas,
    formatPercent,
    formatProfitPercent,
    getDifficultyBadgeClass,
    getDifficultyColor,
    getRankColor
  };
}