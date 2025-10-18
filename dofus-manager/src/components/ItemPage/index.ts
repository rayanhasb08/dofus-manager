import { ItemStore } from '../../stores/ItemStore';
import { 
  ForgemagieDifficulty, 
  CreateItemDTO, 
  UpdateItemDTO,
  ItemWithCalculations,
  FilterOptions
} from '../../types/Item';
import {
  formatKamas,
  formatPercent,
  getDifficultyBadgeClass
} from '../shared/utils';

// Import des templates HTML
import skeletonTemplate from '../shared/skeleton-loader.html?raw';
import filtersTemplate from './templates/filters.html?raw';
import tableTemplate from './templates/table.html?raw';
import emptyStateTemplate from './templates/empty-state.html?raw';
import noResultsTemplate from './templates/no-results.html?raw';
import modalTemplate from './templates/modal.html?raw';

/**
 * Composant Alpine.js pour la page de gestion des items
 */
export function createItemsPage(itemStore: ItemStore) {
  return {
    store: itemStore,
    showModal: false,
    modalMode: 'create' as 'create' | 'edit',
    editingItem: null as ItemWithCalculations | null,
    formData: {
      name: '',
      lotCost: 0,
      forgemageCost: 0,
      difficulty: ForgemagieDifficulty.MOYEN,
      quantity: 1,
      salePrice: 0
    },
    formErrors: {} as Record<string, string>,
    searchDebounceTimer: null as number | null,

    async init() {
      console.log('ItemsPage initialized');
      await this.store.loadData();
    },

    // Getters
    get modalContent() {
      return modalTemplate;
    },
    
    get items() {
      return this.store.getItems();
    },

    get stats() {
      return this.store.getStats();
    },

    get loading() {
      return this.store.isLoading();
    },

    get error() {
      return this.store.getError();
    },

    get filters() {
      return this.store.getFilters();
    },

    // Contenu de la page
    get itemsPageContent() {
      const allItems = this.store.getAllItemsWithoutFilter();
      const filteredItems = this.items;

      // Skeleton loader pendant le chargement initial
      if (this.loading && allItems.length === 0) {
        return skeletonTemplate;
      }

      // État vide - aucun item
      if (allItems.length === 0) {
        return emptyStateTemplate;
      }

      // Aucun résultat avec les filtres
      if (filteredItems.length === 0) {
        return this.buildNoResultsPage();
      }

      // Page normale avec items
      return this.buildItemsPage();
    },

    // Construction de la page "aucun résultat"
    buildNoResultsPage() {
      return `
        ${filtersTemplate}
        
        <div class="mb-4 flex justify-between items-center">
          <p class="text-sm text-slate-400">0 item(s) affiché(s)</p>
          <button @click="openCreateModal()" type="button" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg">
            <span class="flex items-center gap-2">
              <span>+</span>
              Nouvel item
            </span>
          </button>
        </div>

        ${noResultsTemplate}
      `;
    },

    // Construction de la page normale
    buildItemsPage() {
      const itemCount = this.items.length;
      
      return `
        ${this.error ? `
          <div class="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p class="text-red-400 text-sm">${this.error}</p>
          </div>
        ` : ''}

        ${filtersTemplate}

        <div class="mb-4 flex justify-between items-center">
          <p class="text-sm text-slate-400">
            <span>${itemCount}</span> item(s) affiché(s)
          </p>
          <button @click="openCreateModal()" type="button" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg">
            <span class="flex items-center gap-2">
              <span>+</span>
              Nouvel item
            </span>
          </button>
        </div>

        ${tableTemplate}
      `;
    },

    // Méthodes utilitaires (disponibles dans les templates)
    formatKamas,
    formatPercent,
    getDifficultyBadgeClass,

    // Gestion du modal
    openCreateModal() {
      this.modalMode = 'create';
      this.editingItem = null;
      this.resetForm();
      this.showModal = true;
    },

    openEditModal(item: ItemWithCalculations) {
      this.modalMode = 'edit';
      this.editingItem = item;
      this.formData = {
        name: item.name,
        lotCost: item.lotCost,
        forgemageCost: item.forgemageCost,
        difficulty: item.difficulty,
        quantity: item.quantity,
        salePrice: item.salePrice
      };
      this.formErrors = {};
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.resetForm();
    },

    resetForm() {
      this.formData = {
        name: '',
        lotCost: 0,
        forgemageCost: 0,
        difficulty: ForgemagieDifficulty.MOYEN,
        quantity: 1,
        salePrice: 0
      };
      this.formErrors = {};
    },

    // Validation du formulaire
    validateForm(): boolean {
      this.formErrors = {};

      if (!this.formData.name.trim()) {
        this.formErrors.name = 'Le nom est requis';
      }

      if (this.formData.lotCost < 0) {
        this.formErrors.lotCost = 'Le coût ne peut pas être négatif';
      }

      if (this.formData.forgemageCost < 0) {
        this.formErrors.forgemageCost = 'Le coût ne peut pas être négatif';
      }

      if (this.formData.quantity <= 0) {
        this.formErrors.quantity = 'La quantité doit être supérieure à 0';
      }

      if (this.formData.salePrice < 0) {
        this.formErrors.salePrice = 'Le prix ne peut pas être négatif';
      }

      return Object.keys(this.formErrors).length === 0;
    },

    // Soumission du formulaire
    async submitForm() {
      if (!this.validateForm()) return;

      try {
        if (this.modalMode === 'create') {
          await this.store.createItem(this.formData as CreateItemDTO);
        } else if (this.editingItem) {
          await this.store.updateItem({
            id: this.editingItem.id,
            ...this.formData
          } as UpdateItemDTO);
        }
        this.closeModal();
      } catch (err) {
        console.error('Form submission error:', err);
      }
    },

    // Suppression d'un item
    async deleteItem(item: ItemWithCalculations) {
      if (!confirm(`Êtes-vous sûr de vouloir supprimer "${item.name}" ?`)) {
        return;
      }

      try {
        await this.store.deleteItem(item.id);
      } catch (err) {
        console.error('Delete error:', err);
      }
    },

    // Tri
    sort(field: string) {
      this.store.setSorting(field as any);
    },

    // Filtres
    updateFilters(filters: Partial<FilterOptions>) {
      if (filters.search !== undefined) {
        if (this.searchDebounceTimer) {
          clearTimeout(this.searchDebounceTimer);
        }
        this.searchDebounceTimer = setTimeout(() => {
          this.store.setFilters(filters);
        }, 300) as unknown as number;
      } else {
        this.store.setFilters(filters);
      }
    },

    resetFilters() {
      this.store.resetFilters();
    }
  };
}