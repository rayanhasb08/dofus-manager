import Alpine from 'alpinejs';
import { ApiService } from './services/ApiService';
import { ItemStore } from './stores/ItemStore';
import { ForgemagieDifficulty, CreateItemDTO, UpdateItemDTO } from './types/Item';
import './style.css';

// Initialisation
const apiService = new ApiService();
const itemStore = new ItemStore(apiService);

// Alpine Component: App Principal
Alpine.data('itemManager', () => ({
  store: itemStore,
  showModal: false,
  modalMode: 'create' as 'create' | 'edit',
  editingItem: null as any,
  formData: {
    name: '',
    lotCost: 0,
    forgemageCost: 0,
    difficulty: ForgemagieDifficulty.MOYEN,
    quantity: 1,
    salePrice: 0
  },
  formErrors: {} as Record<string, string>,

  // Lifecycle
  async init() {
    console.log('Alpine initialized');
    await this.store.loadData();
  },

  // Getters
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

  get sortField() {
    return this.store.getSortField();
  },

  get sortOrder() {
    return this.store.getSortOrder();
  },

  get filters() {
    return this.store.getFilters();
  },

  get difficulties() {
    return Object.values(ForgemagieDifficulty);
  },

  // Modal Actions
  openCreateModal() {
    console.log('Opening create modal');
    this.modalMode = 'create';
    this.editingItem = null;
    this.resetForm();
    this.showModal = true;
  },

  openEditModal(item: any) {
    console.log('Opening edit modal', item);
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
    console.log('Closing modal');
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

  // Form Validation
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

  // CRUD Actions
  async submitForm() {
    console.log('Submitting form', this.formData);
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

  async deleteItem(item: any) {
    console.log('Deleting item', item);
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${item.name}" ?`)) {
      return;
    }

    try {
      await this.store.deleteItem(item.id);
    } catch (err) {
      console.error('Delete error:', err);
    }
  },

  // Sorting & Filtering
  sort(field: string) {
    this.store.setSorting(field as any);
  },

  updateFilters(filters: any) {
    this.store.setFilters(filters);
  },

  resetFilters() {
    this.store.resetFilters();
  },

  // Formatters
  formatNumber(num: number): string {
    return new Intl.NumberFormat('fr-FR').format(num);
  },

  formatKamas(num: number): string {
    return `${this.formatNumber(Math.round(num))} K`;
  },

  formatPercent(num: number): string {
    return num.toFixed(2); // Juste le nombre, pas de %
  },

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case ForgemagieDifficulty.FACILE:
        return 'text-emerald-400';
      case ForgemagieDifficulty.MOYEN:
        return 'text-amber-400';
      case ForgemagieDifficulty.DIFFICILE:
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  },

  getProfitColor(profit: number): string {
    if (profit > 0) return 'text-emerald-400';
    if (profit < 0) return 'text-red-400';
    return 'text-slate-400';
  },

  // Formatage des inputs
  formatInputNumber(event: any, field: string) {
    let value = event.target.value.replace(/\s/g, ''); // Enlève les espaces
    if (value === '') {
      (this.formData as any)[field] = 0;
      event.target.value = '';
      return;
    }
    const number = parseFloat(value);
    if (!isNaN(number)) {
      (this.formData as any)[field] = number;
      event.target.value = this.formatNumber(number);
    }
  },

  getDisplayValue(field: string): string {
    const value = (this.formData as any)[field];
    return value && value !== 0 ? this.formatNumber(value) : '';
  }
}));

// Start Alpine
Alpine.start();

// Make Alpine available globally for debugging
(window as any).Alpine = Alpine;

console.log('Alpine started, version:', Alpine.version);