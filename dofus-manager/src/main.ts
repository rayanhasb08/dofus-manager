import Alpine from 'alpinejs';
import { router } from './router';
import { ApiService } from './services/ApiService';
import { ItemStore } from './stores/ItemStore';
import { 
  ForgemagieDifficulty, 
  CreateItemDTO, 
  UpdateItemDTO,
  ItemWithCalculations
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
    return `
      <!-- Skeleton Loader -->
      <div ${this.loading && this.items.length === 0 ? '' : 'style="display:none"'}>
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
      <div ${!this.loading || this.items.length > 0 ? '' : 'style="display:none"'}>
        ${this.error ? `
          <div class="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p class="text-red-400 text-sm">${this.error}</p>
          </div>
        ` : ''}

        ${this.items.length > 0 ? this.renderStatsAndTable() : this.renderEmptyState()}
      </div>
    `;
  },

  renderStatsAndTable() {
    const stats = this.stats;
    return `
      <!-- Stats -->
      <div class="mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="stat-card">
            <span class="text-xs font-medium text-slate-400 uppercase block mb-2">Items</span>
            <p class="text-2xl font-semibold">${stats?.totalItems || 0}</p>
          </div>
          <div class="stat-card">
            <span class="text-xs font-medium text-slate-400 uppercase block mb-2">Investissement</span>
            <p class="text-2xl font-semibold">${this.formatKamas(stats?.totalInvestment || 0)}</p>
          </div>
          <div class="stat-card">
            <span class="text-xs font-medium text-slate-400 uppercase block mb-2">Bénéfice</span>
            <p class="text-2xl font-semibold ${stats && stats.totalProfit > 0 ? 'text-emerald-400' : 'text-red-400'}">${this.formatKamas(stats?.totalProfit || 0)}</p>
          </div>
          <div class="stat-card">
            <span class="text-xs font-medium text-slate-400 uppercase block mb-2">Rendement</span>
            <p class="text-2xl font-semibold">${stats?.averageYield ? this.formatPercent(stats.averageYield) : '0'}</p>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="mb-6 card p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-2">Recherche</label>
            <input type="text" x-model="filters.search" @input="updateFilters({ search: $event.target.value })" placeholder="Nom..." class="w-full px-3 py-2 text-sm">
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-2">Difficulté</label>
            <select x-model="filters.difficulty" @change="updateFilters({ difficulty: $event.target.value })" class="w-full px-3 py-2 text-sm">
              <option value="all">Toutes</option>
              <option value="Facile">Facile</option>
              <option value="Moyen">Moyen</option>
              <option value="Difficile">Difficile</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 uppercase mb-2">Rendement min</label>
            <input type="number" x-model.number="filters.minYield" @input="updateFilters({ minYield: Number($event.target.value) })" class="w-full px-3 py-2 text-sm">
          </div>
          <div class="flex items-end">
            <button @click="resetFilters()" type="button" class="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg">
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <!-- Bouton Ajouter -->
      <div class="mb-4 flex justify-end">
        <button @click="openCreateModal()" type="button" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg">
          <span class="flex items-center gap-2">
            <span>+</span>
            Nouvel item
          </span>
        </button>
      </div>

      ${this.renderItemsTable()}
      ${this.renderModal()}
    `;
  },

  renderItemsTable() {
    return `
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr>
                <th @click="sort('name')" class="text-left cursor-pointer">Nom</th>
                <th class="text-right">Coût du lot</th>
                <th class="text-right">Coût de fm</th>
                <th class="text-center">Difficulté</th>
                <th class="text-center">Quantité</th>
                <th class="text-right">Prix vente unit.</th>
                <th @click="sort('costPerItem')" class="text-right cursor-pointer">Coût/item</th>
                <th @click="sort('totalInvestment')" class="text-right cursor-pointer">Investissement</th>
                <th @click="sort('profitPerItem')" class="text-right cursor-pointer">Bénéfice/item</th>
                <th @click="sort('totalProfit')" class="text-right cursor-pointer">Bénéfice total</th>
                <th @click="sort('yield')" class="text-right cursor-pointer">Rendement</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.items.map((item: ItemWithCalculations) => `
                <tr>
                  <td class="font-medium">${item.name}</td>
                  <td class="text-right text-slate-300">${this.formatKamas(item.lotCost)}</td>
                  <td class="text-right text-slate-300">${this.formatKamas(item.forgemageCost)}</td>
                  <td class="text-center">
                    <span class="badge ${this.getDifficultyBadgeClass(item.difficulty)}">${item.difficulty}</span>
                  </td>
                  <td class="text-center text-slate-300">${item.quantity}</td>
                  <td class="text-right text-slate-300">${this.formatKamas(item.salePrice)}</td>
                  <td class="text-right text-amber-400 font-medium">${this.formatKamas(item.calculations.costPerItem)}</td>
                  <td class="text-right text-blue-400 font-medium">${this.formatKamas(item.calculations.totalInvestment)}</td>
                  <td class="text-right font-medium ${item.calculations.profitPerItem > 0 ? 'text-emerald-400' : 'text-red-400'}">${this.formatKamas(item.calculations.profitPerItem)}</td>
                  <td class="text-right font-semibold text-base ${item.calculations.totalProfit > 0 ? 'text-emerald-400' : 'text-red-400'}">${this.formatKamas(item.calculations.totalProfit)}</td>
                  <td class="text-right text-violet-400 font-medium">${this.formatPercent(item.calculations.yield)}</td>
                  <td>
                    <div class="flex items-center justify-center gap-2">
                      <button @click="openEditModal(${JSON.stringify(item).replace(/"/g, '&quot;')})" type="button" class="icon-btn">✏️</button>
                      <button @click="deleteItem(${JSON.stringify(item).replace(/"/g, '&quot;')})" type="button" class="icon-btn">🗑️</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
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

  renderModal() {
    if (!this.showModal) return '';
    
    return `
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="closeModal()">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <h2 class="text-xl font-semibold">${this.modalMode === 'create' ? 'Nouvel item' : 'Modifier'}</h2>
            <button @click="closeModal()" type="button" class="text-slate-400 hover:text-slate-200">✕</button>
          </div>

          <form @submit.prevent="submitForm()" class="p-6 space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Nom</label>
              <input type="text" x-model="formData.name" class="w-full px-3 py-2.5 text-sm" placeholder="Ex: Anneau Brisach">
              ${this.formErrors.name ? `<p class="text-red-400 text-xs mt-1">${this.formErrors.name}</p>` : ''}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">Coût du lot (K)</label>
                <input type="number" x-model.number="formData.lotCost" class="w-full px-3 py-2.5 text-sm" min="0" step="0.01">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">Coût de fm (K)</label>
                <input type="number" x-model.number="formData.forgemageCost" class="w-full px-3 py-2.5 text-sm" min="0" step="0.01">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">Difficulté</label>
                <select x-model="formData.difficulty" class="w-full px-3 py-2.5 text-sm">
                  <option value="Facile">Facile</option>
                  <option value="Moyen">Moyen</option>
                  <option value="Difficile">Difficile</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">Quantité</label>
                <input type="number" x-model.number="formData.quantity" class="w-full px-3 py-2.5 text-sm" min="1">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Prix de vente unitaire (K)</label>
              <input type="number" x-model.number="formData.salePrice" class="w-full px-3 py-2.5 text-sm" min="0" step="0.01">
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" @click="closeModal()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg">
                Annuler
              </button>
              <button type="submit" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg">
                ${this.modalMode === 'create' ? 'Créer' : 'Sauvegarder'}
              </button>
            </div>
          </form>
        </div>
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

  sort(field: string) {
    this.store.setSorting(field as any);
  },

  updateFilters(filters: any) {
    this.store.setFilters(filters);
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

// Start Alpine
Alpine.start();

// Make Alpine and Router available globally
(window as any).Alpine = Alpine;
(window as any).router = router;

console.log('Alpine started with router, version:', Alpine.version);

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
    return this.store.getItems();
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
      <div class="max-w-6xl mx-auto">
        <h2 class="text-2xl font-bold mb-6">Statistiques Globales</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="stat-card">
            <span class="text-xs font-medium text-slate-400 uppercase block mb-2">Total Items</span>
            <p class="text-3xl font-semibold">${stats.totalItems}</p>
          </div>
          <div class="stat-card">
            <span class="text-xs font-medium text-slate-400 uppercase block mb-2">Investissement Total</span>
            <p class="text-3xl font-semibold text-blue-400">${this.formatKamas(stats.totalInvestment)}</p>
          </div>
          <div class="stat-card">
            <span class="text-xs font-medium text-slate-400 uppercase block mb-2">Bénéfice Total</span>
            <p class="text-3xl font-semibold ${stats.totalProfit > 0 ? 'text-emerald-400' : 'text-red-400'}">${this.formatKamas(stats.totalProfit)}</p>
          </div>
          <div class="stat-card">
            <span class="text-xs font-medium text-slate-400 uppercase block mb-2">Rendement Moyen</span>
            <p class="text-3xl font-semibold text-violet-400">${this.formatPercent(stats.averageYield)}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          ${stats.mostProfitable ? `
            <div class="card p-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🏆</span>
                Item le Plus Rentable
              </h3>
              <div class="space-y-2">
                <p class="text-xl font-semibold">${stats.mostProfitable.name}</p>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span class="text-slate-400">Bénéfice total:</span>
                    <p class="font-semibold text-emerald-400">${this.formatKamas(stats.mostProfitable.calculations.totalProfit)}</p>
                  </div>
                  <div>
                    <span class="text-slate-400">Rendement:</span>
                    <p class="font-semibold text-violet-400">${this.formatPercent(stats.mostProfitable.calculations.yield)}</p>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          ${stats.leastProfitable ? `
            <div class="card p-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📉</span>
                Item le Moins Rentable
              </h3>
              <div class="space-y-2">
                <p class="text-xl font-semibold">${stats.leastProfitable.name}</p>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span class="text-slate-400">Bénéfice total:</span>
                    <p class="font-semibold ${stats.leastProfitable.calculations.totalProfit > 0 ? 'text-emerald-400' : 'text-red-400'}">${this.formatKamas(stats.leastProfitable.calculations.totalProfit)}</p>
                  </div>
                  <div>
                    <span class="text-slate-400">Rendement:</span>
                    <p class="font-semibold text-violet-400">${this.formatPercent(stats.leastProfitable.calculations.yield)}</p>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}
        </div>

        <div class="card p-6">
          <h3 class="text-lg font-semibold mb-4">Top 5 Items par Bénéfice</h3>
          <div class="space-y-3">
            ${this.getTopItems(items, 5).map((item: ItemWithCalculations, index: number) => `
              <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div class="flex items-center gap-3">
                  <span class="text-2xl font-bold text-slate-600">#${index + 1}</span>
                  <div>
                    <p class="font-semibold">${item.name}</p>
                    <p class="text-xs text-slate-400">Quantité: ${item.quantity}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold ${item.calculations.totalProfit > 0 ? 'text-emerald-400' : 'text-red-400'}">${this.formatKamas(item.calculations.totalProfit)}</p>
                  <p class="text-xs text-slate-400">Rendement: ${this.formatPercent(item.calculations.yield)}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  getTopItems(items: ItemWithCalculations[], limit: number): ItemWithCalculations[] {
    return [...items]
      .sort((a, b) => b.calculations.totalProfit - a.calculations.totalProfit)
      .slice(0, limit);
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