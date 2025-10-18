import { ApiService } from '../services/ApiService';
import { 
  ItemWithCalculations, 
  ItemStats, 
  CreateItemDTO, 
  UpdateItemDTO,
  SortField,
  SortOrder,
  FilterOptions,
  ForgemagieDifficulty
} from '../types/Item';

/**
 * Store principal pour la gestion de l'état des items
 * Pattern: Store/State Management + Observer
 */
export class ItemStore {
  private items: ItemWithCalculations[] = [];
  private stats: ItemStats | null = null;
  private loading: boolean = false;
  private error: string | null = null;
  private sortField: SortField = 'createdAt';
  private sortOrder: SortOrder = 'desc';
  private filters: FilterOptions = {
    search: '',
    difficulty: 'all',
    minYield: 0,
    maxYield: Infinity,
    minLotCost: 0,
    maxLotCost: Infinity,
    minProfit: -Infinity
  };

  constructor(private readonly apiService: ApiService) {}

  /**
   * Getters pour Alpine.js
   */
  getItems(): ItemWithCalculations[] {
    return this.applyFiltersAndSort(this.items);
  }

  getAllItemsWithoutFilter(): ItemWithCalculations[] {
    return this.items;
  }
  
  getStats(): ItemStats | null {
    return this.stats;
  }

  isLoading(): boolean {
    return this.loading;
  }

  getError(): string | null {
    return this.error;
  }

  getSortField(): SortField {
    return this.sortField;
  }

  getSortOrder(): SortOrder {
    return this.sortOrder;
  }

  getFilters(): FilterOptions {
    return { ...this.filters };
  }

  /**
   * Charge tous les items et les stats
   */
  async loadData(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const [items, stats] = await Promise.all([
        this.apiService.getItems(),
        this.apiService.getStats()
      ]);

      this.items = items;
      this.stats = stats;
    } catch (err: any) {
      this.error = err.message;
      console.error('Error loading data:', err);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Crée un nouvel item
   */
  async createItem(data: CreateItemDTO): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      await this.apiService.createItem(data);
      await this.loadData(); // Recharge tout pour mettre à jour les stats
    } catch (err: any) {
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Met à jour un item
   */
  async updateItem(data: UpdateItemDTO): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      await this.apiService.updateItem(data);
      await this.loadData();
    } catch (err: any) {
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Supprime un item
   */
  async deleteItem(id: string): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      await this.apiService.deleteItem(id);
      await this.loadData();
    } catch (err: any) {
      this.error = err.message;
      throw err;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Change le tri
   */
  setSorting(field: SortField, order?: SortOrder): void {
    if (this.sortField === field && !order) {
      // Toggle order si même field
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = order || 'desc';
    }
  }

  /**
   * Met à jour les filtres
   */
  setFilters(filters: Partial<FilterOptions>): void {
    this.filters = { ...this.filters, ...filters };
  }

  /**
   * Réinitialise les filtres
   */
  resetFilters(): void {
    this.filters = {
      search: '',
      difficulty: 'all',
      minYield: 0,
      maxYield: Infinity,
      minLotCost: 0,
      maxLotCost: Infinity,
      minProfit: -Infinity
    };
  }

  /**
   * Applique les filtres et le tri aux items
   */
  private applyFiltersAndSort(items: ItemWithCalculations[]): ItemWithCalculations[] {
    let filtered = [...items];

    // Filtre par recherche
    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(search)
      );
    }

    // Filtre par difficulté
    if (this.filters.difficulty !== 'all') {
      filtered = filtered.filter(item => 
        item.difficulty === this.filters.difficulty
      );
    }

    // Filtre par rendement
    filtered = filtered.filter(item => 
      item.calculations.yield >= this.filters.minYield &&
      item.calculations.yield <= this.filters.maxYield
    );

    // Filtre par coût du lot
    filtered = filtered.filter(item =>
      item.lotCost >= this.filters.minLotCost &&
      item.lotCost <= this.filters.maxLotCost
    );

    // Filtre par bénéfice total
    filtered = filtered.filter(item =>
      item.calculations.totalProfit >= this.filters.minProfit
    );

    // Tri
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (this.sortField === 'name') {
        aValue = a.name;
        bValue = b.name;
      } else if (this.sortField === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else {
        aValue = a.calculations[this.sortField];
        bValue = b.calculations[this.sortField];
      }

      if (typeof aValue === 'string') {
        return this.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return this.sortOrder === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    });

    return filtered;
  }
}