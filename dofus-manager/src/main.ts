import Alpine from 'alpinejs';
import { router } from './router';
import { ApiService } from './services/ApiService';
import { ItemStore } from './stores/ItemStore';
import { 
  ForgemagieDifficulty, 
  CreateItemDTO, 
  UpdateItemDTO,
  ItemWithCalculations,
  FilterOptions,
  ItemStats
} from './types/Item';
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
Alpine.data('itemManager', () => ({
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
    console.log('ItemManager initialized');
    await this.store.loadData();
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

  get itemsPageContent() {
    const allItems = this.store.getAllItemsWithoutFilter(); // Tous les items sans filtre
    const filteredItems = this.items; // Items filtrés
    return `
      <!-- Skeleton Loader -->
      <div ${this.loading && allItems.length === 0 ? '' : 'style="display:none"'}>
        <div class="mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            ${[1,2,3,4].map(() => `
              <div class="skeleton-card">
                <div class="skeleton-line w-24 h-3 mb-3"></div>
                <div class="skeleton-line w-32 h-8"></div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr>
                  <th class="text-left">Nom</th>
                  <th class="text-right">Coût du lot</th>
                  <th class="text-right">Coût de fm</th>
                  <th class="text-center">Difficulté</th>
                  <th class="text-center">Quantité</th>
                  <th class="text-right">Prix vente unit.</th>
                  <th class="text-right">Coût/item</th>
                  <th class="text-right">Investissement</th>
                  <th class="text-right">Bénéfice/item</th>
                  <th class="text-right">Bénéfice total</th>
                  <th class="text-right">Rendement</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${[1,2,3,4,5].map(() => `
                  <tr>
                    <td><div class="skeleton-line w-32 h-4"></div></td>
                    <td><div class="skeleton-line w-20 h-4 ml-auto"></div></td>
                    <td><div class="skeleton-line w-20 h-4 ml-auto"></div></td>
                    <td><div class="skeleton-badge mx-auto"></div></td>
                    <td><div class="skeleton-line w-12 h-4 mx-auto"></div></td>
                    <td><div class="skeleton-line w-20 h-4 ml-auto"></div></td>
                    <td><div class="skeleton-line w-20 h-4 ml-auto"></div></td>
                    <td><div class="skeleton-line w-24 h-4 ml-auto"></div></td>
                    <td><div class="skeleton-line w-20 h-4 ml-auto"></div></td>
                    <td><div class="skeleton-line w-24 h-4 ml-auto"></div></td>
                    <td><div class="skeleton-line w-16 h-4 ml-auto"></div></td>
                    <td>
                      <div class="flex items-center justify-center gap-2">
                        <div class="skeleton-circle"></div>
                        <div class="skeleton-circle"></div>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Contenu réel -->
      <div ${!this.loading || allItems.length > 0 ? '' : 'style="display:none"'}>
        ${this.error ? `
          <div class="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p class="text-red-400 text-sm">${this.error}</p>
          </div>
        ` : ''}

        ${allItems.length === 0 ? this.renderEmptyState() : 
        filteredItems.length === 0 ? this.renderNoResultsState() : 
        this.renderStatsAndTable()}
      </div>
    `;
  },

  renderStatsAndTable() {
    return `
      <!-- Filtres Complets -->
      <div class="mb-6 card p-4">
        <h3 class="text-lg font-semibold mb-4">Filtres de recherche</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Recherche par nom -->
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-2">Nom</label>
            <input 
              type="text" 
              x-model="filters.search" 
              @input="updateFilters({ search: $event.target.value })" 
              placeholder="Rechercher..." 
              class="w-full px-3 py-2 text-sm"
            >
          </div>

          <!-- Difficulté -->
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-2">Difficulté</label>
            <select 
              x-model="filters.difficulty" 
              @change="updateFilters({ difficulty: $event.target.value })" 
              class="w-full px-3 py-2 text-sm"
            >
              <option value="all">Toutes</option>
              <option value="Facile">Facile</option>
              <option value="Moyen">Moyen</option>
              <option value="Difficile">Difficile</option>
            </select>
          </div>

          <!-- Rendement minimum -->
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-2">Rendement min</label>
            <input 
              type="number" 
              x-model.number="filters.minYield" 
              @input="updateFilters({ minYield: Number($event.target.value) })" 
              placeholder="Ex: 1.2"
              step="0.1"
              class="w-full px-3 py-2 text-sm"
            >
          </div>

          <!-- Rendement maximum -->
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-2">Rendement max</label>
            <input 
              type="number" 
              x-model.number="filters.maxYield" 
              @input="updateFilters({ maxYield: Number($event.target.value) })" 
              placeholder="Ex: 2.0"
              step="0.1"
              class="w-full px-3 py-2 text-sm"
            >
          </div>

          <!-- Coût lot minimum -->
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-2">Coût lot min (K)</label>
            <input 
              type="number" 
              x-model.number="filters.minLotCost" 
              @input="updateFilters({ minLotCost: Number($event.target.value) })" 
              placeholder="0"
              class="w-full px-3 py-2 text-sm"
            >
          </div>

          <!-- Coût lot maximum -->
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-2">Coût lot max (K)</label>
            <input 
              type="number" 
              x-model.number="filters.maxLotCost" 
              @input="updateFilters({ maxLotCost: Number($event.target.value) })" 
              placeholder="Illimité"
              class="w-full px-3 py-2 text-sm"
            >
          </div>

          <!-- Bénéfice minimum -->
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-2">Bénéfice min (K)</label>
            <input 
              type="number" 
              x-model.number="filters.minProfit" 
              @input="updateFilters({ minProfit: Number($event.target.value) })" 
              placeholder="-999999"
              class="w-full px-3 py-2 text-sm"
            >
          </div>

          <!-- Bouton Reset -->
          <div class="flex items-end">
            <button 
              @click="resetFilters()" 
              type="button" 
              class="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg flex items-center justify-center gap-2"
            >
              <span>🔄</span>
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <!-- Bouton Ajouter -->
      <div class="mb-4 flex justify-between items-center">
        <p class="text-sm text-slate-400">
          <span x-text="items.length"></span> item(s) affiché(s)
        </p>
        <button @click="openCreateModal()" type="button" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg">
          <span class="flex items-center gap-2">
            <span>+</span>
            Nouvel item
          </span>
        </button>
      </div>

      ${this.renderItemsTable()}
    `;
  },

  renderItemsTable() {
    return `
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr>
                <th @click="sort('name')" class="cursor-pointer">Nom</th>
                <th @click="sort('lotCost')" class="cursor-pointer">Coût du lot</th>
                <th @click="sort('forgemageCost')" class="cursor-pointer">Coût de fm</th>
                <th>Difficulté</th>
                <th>Quantité</th>
                <th @click="sort('salePrice')" class="cursor-pointer">Prix vente unit.</th>
                <th @click="sort('costPerItem')" class="cursor-pointer">Coût/item</th>
                <th @click="sort('totalInvestment')" class="cursor-pointer">Investissement</th>
                <th @click="sort('profitPerItem')" class="cursor-pointer">Bénéfice/item</th>
                <th @click="sort('totalProfit')" class="cursor-pointer">Bénéfice total</th>
                <th @click="sort('yield')" class="cursor-pointer">Rendement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <template x-for="(item, index) in items" :key="item.id">
                <tr>
                  <td x-text="item.name"></td>
                  <td x-text="formatKamas(item.lotCost)"></td>
                  <td x-text="formatKamas(item.forgemageCost)"></td>
                  <td>
                    <span class="badge" :class="getDifficultyBadgeClass(item.difficulty)" x-text="item.difficulty"></span>
                  </td>
                  <td x-text="item.quantity"></td>
                  <td x-text="formatKamas(item.salePrice)"></td>
                  <td x-text="formatKamas(item.calculations.costPerItem)"></td>
                  <td x-text="formatKamas(item.calculations.totalInvestment)"></td>
                  <td :class="item.calculations.profitPerItem > 0 ? 'text-emerald-400' : 'text-red-400'" x-text="formatKamas(item.calculations.profitPerItem)"></td>
                  <td :class="item.calculations.totalProfit > 0 ? 'text-emerald-400' : 'text-red-400'" x-text="formatKamas(item.calculations.totalProfit)"></td>
                  <td x-text="formatPercent(item.calculations.yield)"></td>
                  <td>
                    <div class="flex items-center justify-center gap-2">
                      <button @click="openEditModal(item)" type="button" class="icon-btn">✏️</button>
                      <button @click="deleteItem(item)" type="button" class="icon-btn">🗑️</button>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderEmptyState() {
    return `
      <div class="text-center py-16">
        <div class="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <span class="text-3xl">📦</span>
        </div>
        <h3 class="text-xl font-semibold mb-2">Aucun item</h3>
        <p class="text-slate-400 text-sm mb-6">Commencez par ajouter votre premier item</p>
        <button @click="openCreateModal()" type="button" class="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl inline-flex items-center gap-2">
          <span>+</span>
          Ajouter un item
        </button>
      </div>
    `;
  },
  renderNoResultsState() {
    return `
      <!-- Filtres Complets (même code que renderStatsAndTable) -->
      <div class="mb-6 card p-4">
        <h3 class="text-lg font-semibold mb-4">Filtres de recherche</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Recherche par nom -->
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-2">Nom</label>
            <input 
              type="text" 
              x-model="filters.search" 
              @input="updateFilters({ search: $event.target.value })" 
              placeholder="Rechercher..." 
              class="w-full px-3 py-2 text-sm"
            >
          </div>

          <!-- Difficulté -->
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-2">Difficulté</label>
            <select 
              x-model="filters.difficulty" 
              @change="updateFilters({ difficulty: $event.target.value })" 
              class="w-full px-3 py-2 text-sm"
            >
              <option value="all">Toutes</option>
              <option value="Facile">Facile</option>
              <option value="Moyen">Moyen</option>
              <option value="Difficile">Difficile</option>
            </select>
          </div>

          <!-- Rendement minimum -->
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-2">Rendement min</label>
            <input 
              type="number" 
              x-model.number="filters.minYield" 
              @input="updateFilters({ minYield: Number($event.target.value) })" 
              placeholder="Ex: 1.2"
              step="0.1"
              class="w-full px-3 py-2 text-sm"
            >
          </div>

          <!-- Rendement maximum -->
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-2">Rendement max</label>
            <input 
              type="number" 
              x-model.number="filters.maxYield" 
              @input="updateFilters({ maxYield: Number($event.target.value) })" 
              placeholder="Ex: 2.0"
              step="0.1"
              class="w-full px-3 py-2 text-sm"
            >
          </div>

          <!-- Coût lot minimum -->
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-2">Coût lot min (K)</label>
            <input 
              type="number" 
              x-model.number="filters.minLotCost" 
              @input="updateFilters({ minLotCost: Number($event.target.value) })" 
              placeholder="0"
              class="w-full px-3 py-2 text-sm"
            >
          </div>

          <!-- Coût lot maximum -->
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-2">Coût lot max (K)</label>
            <input 
              type="number" 
              x-model.number="filters.maxLotCost" 
              @input="updateFilters({ maxLotCost: Number($event.target.value) })" 
              placeholder="Illimité"
              class="w-full px-3 py-2 text-sm"
            >
          </div>

          <!-- Bénéfice minimum -->
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-2">Bénéfice min (K)</label>
            <input 
              type="number" 
              x-model.number="filters.minProfit" 
              @input="updateFilters({ minProfit: Number($event.target.value) })" 
              placeholder="-999999"
              class="w-full px-3 py-2 text-sm"
            >
          </div>

          <!-- Bouton Reset -->
          <div class="flex items-end">
            <button 
              @click="resetFilters()" 
              type="button" 
              class="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg flex items-center justify-center gap-2"
            >
              <span>🔄</span>
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <!-- Bouton Ajouter -->
      <div class="mb-4 flex justify-between items-center">
        <p class="text-sm text-slate-400">
          0 item(s) affiché(s)
        </p>
        <button @click="openCreateModal()" type="button" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg">
          <span class="flex items-center gap-2">
            <span>+</span>
            Nouvel item
          </span>
        </button>
      </div>

      <!-- Message Aucun résultat -->
      <div class="card p-12 text-center">
        <div class="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <span class="text-3xl">🔍</span>
        </div>
        <h3 class="text-xl font-semibold mb-2">Aucun résultat</h3>
        <p class="text-slate-400 text-sm">Aucun item ne correspond aux filtres appliqués. Ajustez vos critères de recherche.</p>
      </div>
    `;
  },

  getDifficultyBadgeClass(difficulty: string) {
    switch (difficulty) {
      case 'Facile': return 'badge-success';
      case 'Moyen': return 'badge-warning';
      case 'Difficile': return 'badge-error';
      default: return '';
    }
  },

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
  openEditModalByIndex(index: number) {
  const item = this.items[index];
  if (item) this.openEditModal(item);
  },

  deleteItemByIndex(index: number) {
    const item = this.items[index];
    if (item) this.deleteItem(item);
  },

  sort(field: string) {
    this.store.setSorting(field as any);
  },

  updateFilters(filters: Partial<FilterOptions>) {
    // Si c'est une recherche, ajouter un debounce
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
  },

  formatNumber(num: number): string {
    return new Intl.NumberFormat('fr-FR').format(num);
  },

  formatKamas(num: number): string {
    return `${this.formatNumber(Math.round(num))} K`;
  },

  formatPercent(num: number): string {
    return num.toFixed(2);
  }
}));

// Alpine Component: Page des Statistiques
// Alpine Component: Page des Statistiques
Alpine.data('statsPage', () => ({
  store: itemStore,

  async init() {
    await this.store.loadData();
  },

  get stats() {
    return this.store.getStats();
  },

  get items() {
    return this.store.getAllItemsWithoutFilter();
  },

  get loading() {
    return this.store.isLoading();
  },

  get statsPageContent() {
    const stats = this.stats;
    const items = this.items;

    if (this.loading) {
      return '<div class="text-center py-12"><div class="spinner w-10 h-10 mx-auto"></div></div>';
    }

    if (!stats || items.length === 0) {
      return `
        <div class="text-center py-16">
          <div class="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">📊</span>
          </div>
          <h3 class="text-xl font-semibold mb-2">Aucune statistique</h3>
          <p class="text-slate-400 text-sm mb-6">Ajoutez des items pour voir les statistiques</p>
          <button onclick="window.router.navigate('/items')" class="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl">
            Gérer les items
          </button>
        </div>
      `;
    }

    return `
      <div class="max-w-7xl mx-auto space-y-8">
        
        <!-- En-tête -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-3xl font-bold">Statistiques Globales</h2>
            <p class="text-slate-400 text-sm mt-1">Analyse complète de vos activités de craft & forgemagie</p>
          </div>
          <button onclick="window.router.navigate('/items')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg">
            ← Retour aux items
          </button>
        </div>

        <!-- Stats Principales -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="stat-card">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-slate-400 uppercase">Total Items</span>
              <span class="text-2xl">📦</span>
            </div>
            <p class="text-3xl font-bold">${stats.totalItems}</p>
            <p class="text-xs text-slate-500 mt-1">Items en inventaire</p>
          </div>

          <div class="stat-card">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-slate-400 uppercase">Investissement Total</span>
              <span class="text-2xl">💰</span>
            </div>
            <p class="text-3xl font-bold text-blue-400">${this.formatKamas(stats.totalInvestment)}</p>
            <p class="text-xs text-slate-500 mt-1">Capital engagé</p>
          </div>

          <div class="stat-card">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-slate-400 uppercase">Bénéfice Total</span>
              <span class="text-2xl">${stats.totalProfit > 0 ? '📈' : '📉'}</span>
            </div>
            <p class="text-3xl font-bold ${stats.totalProfit > 0 ? 'text-emerald-400' : 'text-red-400'}">${this.formatKamas(stats.totalProfit)}</p>
            <p class="text-xs ${stats.totalProfit > 0 ? 'text-emerald-500' : 'text-red-500'} mt-1">
              ${stats.totalProfit > 0 ? '+' : ''}${this.formatPercent((stats.totalProfit / stats.totalInvestment) * 100)}% du capital
            </p>
          </div>

          <div class="stat-card">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-slate-400 uppercase">Rendement Moyen</span>
              <span class="text-2xl">⚡</span>
            </div>
            <p class="text-3xl font-bold text-violet-400">${this.formatPercent(stats.averageYield)}</p>
            <p class="text-xs text-slate-500 mt-1">Coefficient multiplicateur</p>
          </div>
        </div>

        <!-- Stats Avancées -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="card p-6">
            <h3 class="text-sm font-semibold text-slate-400 uppercase mb-4">Répartition par Difficulté</h3>
            <div class="space-y-3">
              ${this.getDifficultyStats(items).map((stat: any) => `
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium">${stat.difficulty}</span>
                    <span class="text-sm text-slate-400">${stat.count} items (${stat.percentage}%)</span>
                  </div>
                  <div class="w-full bg-slate-800 rounded-full h-2">
                    <div class="h-2 rounded-full ${this.getDifficultyColor(stat.difficulty)}" style="width: ${stat.percentage}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="card p-6">
            <h3 class="text-sm font-semibold text-slate-400 uppercase mb-4">Analyse de Rentabilité</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                <div>
                  <p class="text-xs text-slate-400">Items Rentables</p>
                  <p class="text-lg font-semibold text-emerald-400">${this.getProfitableCount(items, true)}</p>
                </div>
                <span class="text-2xl">✅</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                <div>
                  <p class="text-xs text-slate-400">Items en Perte</p>
                  <p class="text-lg font-semibold text-red-400">${this.getProfitableCount(items, false)}</p>
                </div>
                <span class="text-2xl">❌</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div>
                  <p class="text-xs text-slate-400">Taux de Réussite</p>
                  <p class="text-lg font-semibold text-slate-200">${this.getSuccessRate(items)}%</p>
                </div>
                <span class="text-2xl">🎯</span>
              </div>
            </div>
          </div>

          <div class="card p-6">
            <h3 class="text-sm font-semibold text-slate-400 uppercase mb-4">Valeurs Moyennes</h3>
            <div class="space-y-3">
              <div>
                <p class="text-xs text-slate-400 mb-1">Coût moyen par item</p>
                <p class="text-lg font-semibold text-amber-400">${this.formatKamas(this.getAverageCostPerItem(items))}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-1">Bénéfice moyen par item</p>
                <p class="text-lg font-semibold text-emerald-400">${this.formatKamas(this.getAverageProfitPerItem(items))}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-1">Investissement moyen</p>
                <p class="text-lg font-semibold text-blue-400">${this.formatKamas(stats.totalInvestment / stats.totalItems)}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Items Extrêmes -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          ${stats.mostProfitable ? `
            <div class="card p-6">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-3xl">🏆</span>
                <div>
                  <h3 class="text-lg font-semibold">Item le Plus Rentable</h3>
                  <p class="text-xs text-slate-400">Meilleur bénéfice total</p>
                </div>
              </div>
              <div class="bg-slate-800/50 rounded-xl p-4">
                <p class="text-xl font-bold mb-3">${stats.mostProfitable.name}</p>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-slate-400">Difficulté</p>
                    <span class="badge ${this.getDifficultyBadgeClass(stats.mostProfitable.difficulty)} mt-1">${stats.mostProfitable.difficulty}</span>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400">Quantité</p>
                    <p class="text-sm font-semibold mt-1">${stats.mostProfitable.quantity} items</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400">Investissement</p>
                    <p class="text-sm font-semibold text-blue-400 mt-1">${this.formatKamas(stats.mostProfitable.calculations.totalInvestment)}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400">Bénéfice Total</p>
                    <p class="text-sm font-semibold text-emerald-400 mt-1">${this.formatKamas(stats.mostProfitable.calculations.totalProfit)}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400">Rendement</p>
                    <p class="text-sm font-semibold text-violet-400 mt-1">${this.formatPercent(stats.mostProfitable.calculations.yield)}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400">Bénéfice/item</p>
                    <p class="text-sm font-semibold text-emerald-400 mt-1">${this.formatKamas(stats.mostProfitable.calculations.profitPerItem)}</p>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          ${stats.leastProfitable ? `
            <div class="card p-6">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-3xl">📉</span>
                <div>
                  <h3 class="text-lg font-semibold">Item le Moins Rentable</h3>
                  <p class="text-xs text-slate-400">À améliorer ou éviter</p>
                </div>
              </div>
              <div class="bg-slate-800/50 rounded-xl p-4">
                <p class="text-xl font-bold mb-3">${stats.leastProfitable.name}</p>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-slate-400">Difficulté</p>
                    <span class="badge ${this.getDifficultyBadgeClass(stats.leastProfitable.difficulty)} mt-1">${stats.leastProfitable.difficulty}</span>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400">Quantité</p>
                    <p class="text-sm font-semibold mt-1">${stats.leastProfitable.quantity} items</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400">Investissement</p>
                    <p class="text-sm font-semibold text-blue-400 mt-1">${this.formatKamas(stats.leastProfitable.calculations.totalInvestment)}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400">Bénéfice Total</p>
                    <p class="text-sm font-semibold ${stats.leastProfitable.calculations.totalProfit > 0 ? 'text-emerald-400' : 'text-red-400'} mt-1">${this.formatKamas(stats.leastProfitable.calculations.totalProfit)}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400">Rendement</p>
                    <p class="text-sm font-semibold text-violet-400 mt-1">${this.formatPercent(stats.leastProfitable.calculations.yield)}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400">Bénéfice/item</p>
                    <p class="text-sm font-semibold ${stats.leastProfitable.calculations.profitPerItem > 0 ? 'text-emerald-400' : 'text-red-400'} mt-1">${this.formatKamas(stats.leastProfitable.calculations.profitPerItem)}</p>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Top 10 Items par Bénéfice -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🎖️</span>
              <div>
                <h3 class="text-lg font-semibold">Top 10 Items par Bénéfice</h3>
                <p class="text-xs text-slate-400">Classement des items les plus performants</p>
              </div>
            </div>
          </div>
          <div class="space-y-3">
            ${this.getTopItems(items, 10).map((item: ItemWithCalculations, index: number) => `
              <div class="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all">
                <div class="flex-shrink-0 w-12 h-12 rounded-full ${this.getRankColor(index)} flex items-center justify-center">
                  <span class="text-lg font-bold">#${index + 1}</span>
                </div>
                <div class="flex-grow min-w-0">
                  <p class="font-semibold text-sm truncate">${item.name}</p>
                  <div class="flex items-center gap-3 mt-1">
                    <span class="badge badge-sm ${this.getDifficultyBadgeClass(item.difficulty)}">${item.difficulty}</span>
                    <span class="text-xs text-slate-400">Qty: ${item.quantity}</span>
                  </div>
                </div>
                <div class="flex-shrink-0 text-right">
                  <p class="text-sm font-semibold ${item.calculations.totalProfit > 0 ? 'text-emerald-400' : 'text-red-400'}">${this.formatKamas(item.calculations.totalProfit)}</p>
                  <p class="text-xs text-slate-400 mt-0.5">Rendement: ${this.formatPercent(item.calculations.yield)}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Top 10 Items par Rendement -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <span class="text-2xl">⚡</span>
              <div>
                <h3 class="text-lg font-semibold">Top 10 Items par Rendement</h3>
                <p class="text-xs text-slate-400">Items avec le meilleur coefficient multiplicateur</p>
              </div>
            </div>
          </div>
          <div class="space-y-3">
            ${this.getTopItemsByYield(items, 10).map((item: ItemWithCalculations, index: number) => `
              <div class="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all">
                <div class="flex-shrink-0 w-12 h-12 rounded-full ${this.getRankColor(index)} flex items-center justify-center">
                  <span class="text-lg font-bold">#${index + 1}</span>
                </div>
                <div class="flex-grow min-w-0">
                  <p class="font-semibold text-sm truncate">${item.name}</p>
                  <div class="flex items-center gap-3 mt-1">
                    <span class="badge badge-sm ${this.getDifficultyBadgeClass(item.difficulty)}">${item.difficulty}</span>
                    <span class="text-xs text-slate-400">Qty: ${item.quantity}</span>
                  </div>
                </div>
                <div class="flex-shrink-0 text-right">
                  <p class="text-sm font-semibold text-violet-400">${this.formatPercent(item.calculations.yield)}</p>
                  <p class="text-xs text-slate-400 mt-0.5">Bénéfice: ${this.formatKamas(item.calculations.totalProfit)}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // Méthodes utilitaires
  getDifficultyStats(items: ItemWithCalculations[]) {
    const total = items.length;
    const stats: Record<string, number> = {
      'Facile': 0,
      'Moyen': 0,
      'Difficile': 0
    };
    
    items.forEach((item: ItemWithCalculations) => {
      stats[item.difficulty]++;
    });

    return Object.entries(stats).map(([difficulty, count]) => ({
      difficulty,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  },

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Facile': return 'bg-emerald-500';
      case 'Moyen': return 'bg-amber-500';
      case 'Difficile': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  },

  getProfitableCount(items: ItemWithCalculations[], profitable: boolean): number {
    return items.filter((item: ItemWithCalculations) => 
      profitable ? item.calculations.totalProfit > 0 : item.calculations.totalProfit <= 0
    ).length;
  },

  getSuccessRate(items: ItemWithCalculations[]): number {
    const profitable = this.getProfitableCount(items, true);
    return Math.round((profitable / items.length) * 100);
  },

  getAverageCostPerItem(items: ItemWithCalculations[]): number {
    const total = items.reduce((sum: number, item: ItemWithCalculations) => sum + item.calculations.costPerItem, 0);
    return total / items.length;
  },

  getAverageProfitPerItem(items: ItemWithCalculations[]): number {
    const total = items.reduce((sum: number, item: ItemWithCalculations) => sum + item.calculations.profitPerItem, 0);
    return total / items.length;
  },

  getTopItems(items: ItemWithCalculations[], limit: number): ItemWithCalculations[] {
    return [...items]
      .sort((a, b) => b.calculations.totalProfit - a.calculations.totalProfit)
      .slice(0, limit);
  },

  getTopItemsByYield(items: ItemWithCalculations[], limit: number): ItemWithCalculations[] {
    return [...items]
      .sort((a, b) => b.calculations.yield - a.calculations.yield)
      .slice(0, limit);
  },

  getRankColor(index: number): string {
    if (index === 0) return 'bg-gradient-to-br from-yellow-500 to-yellow-600';
    if (index === 1) return 'bg-gradient-to-br from-slate-400 to-slate-500';
    if (index === 2) return 'bg-gradient-to-br from-orange-600 to-orange-700';
    return 'bg-slate-700';
  },

  getDifficultyBadgeClass(difficulty: string): string {
    switch (difficulty) {
      case 'Facile': return 'badge-success';
      case 'Moyen': return 'badge-warning';
      case 'Difficile': return 'badge-error';
      default: return '';
    }
  },

  formatKamas(num: number): string {
    return `${Math.round(num).toLocaleString('fr-FR')} K`;
  },

  formatPercent(num: number): string {
    return num.toFixed(2);
  }
}));

// Start Alpine
Alpine.start();

// Make Alpine and Router available globally
(window as any).Alpine = Alpine;
(window as any).router = router;

console.log('Alpine started with router, version:', Alpine.version);