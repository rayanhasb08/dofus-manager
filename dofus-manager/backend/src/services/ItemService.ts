import { ItemRepository } from '../repositories/ItemRepository.js';
import { CalculatorService } from './CalculatorService.js';
import {
  CreateItemDTO,
  UpdateItemDTO,
  ItemWithCalculations,
  ItemStats
} from '../models/Item.js';

/**
 * Service principal pour la gestion des items
 * Pattern: Service Layer + Facade
 */
export class ItemService {
  constructor(private readonly repository: ItemRepository) {}

  /**
   * Récupère tous les items avec leurs calculs
   */
  async getAllItems(): Promise<ItemWithCalculations[]> {
    const items = await this.repository.findAll();
    return items.map(item => CalculatorService.enrichItem(item));
  }

  /**
   * Récupère un item par ID avec ses calculs
   */
  async getItemById(id: string): Promise<ItemWithCalculations | null> {
    const item = await this.repository.findById(id);
    if (!item) return null;
    return CalculatorService.enrichItem(item);
  }

  /**
   * Crée un nouvel item
   */
  async createItem(data: CreateItemDTO): Promise<ItemWithCalculations> {
    this.validateItemData(data);
    const item = await this.repository.create(data);
    return CalculatorService.enrichItem(item);
  }

  /**
   * Met à jour un item
   */
  async updateItem(data: UpdateItemDTO): Promise<ItemWithCalculations | null> {
    // Validation seulement si les champs sont fournis
    if (Object.keys(data).length > 1) { // Plus que juste l'ID
      this.validateItemData(data as Partial<CreateItemDTO>);
    }
    
    const item = await this.repository.update(data);
    if (!item) return null;
    
    return CalculatorService.enrichItem(item);
  }

  /**
   * Supprime un item
   */
  async deleteItem(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }

  /**
   * Calcule les statistiques globales
   */
  async getStats(): Promise<ItemStats> {
    const items = await this.getAllItems();

    if (items.length === 0) {
      return {
        totalItems: 0,
        totalInvestment: 0,
        totalProfit: 0,
        averageYield: 0,
        mostProfitable: null,
        leastProfitable: null
      };
    }

    const totalInvestment = items.reduce(
      (sum, item) => sum + item.calculations.totalInvestment,
      0
    );

    const totalProfit = items.reduce(
      (sum, item) => sum + item.calculations.totalProfit,
      0
    );

    const averageYield = items.reduce(
      (sum, item) => sum + item.calculations.yield,
      0
    ) / items.length;

    // Tri par profit total pour trouver le plus et moins rentable
    const sortedByProfit = [...items].sort(
      (a, b) => b.calculations.totalProfit - a.calculations.totalProfit
    );

    return {
      totalItems: items.length,
      totalInvestment: this.roundToTwo(totalInvestment),
      totalProfit: this.roundToTwo(totalProfit),
      averageYield: this.roundToTwo(averageYield),
      mostProfitable: sortedByProfit[0] || null,
      leastProfitable: sortedByProfit[sortedByProfit.length - 1] || null
    };
  }

  /**
   * Valide les données d'un item
   */
  private validateItemData(data: Partial<CreateItemDTO>): void {
    if (data.name !== undefined && data.name.trim() === '') {
      throw new Error('Le nom de l\'item est requis');
    }

    if (data.lotCost !== undefined && data.lotCost < 0) {
      throw new Error('Le coût du lot ne peut pas être négatif');
    }

    if (data.forgemageCost !== undefined && data.forgemageCost < 0) {
      throw new Error('Le coût de forgemagie ne peut pas être négatif');
    }

    if (data.quantity !== undefined && data.quantity <= 0) {
      throw new Error('La quantité doit être supérieure à 0');
    }

    if (data.salePrice !== undefined && data.salePrice < 0) {
      throw new Error('Le prix de vente ne peut pas être négatif');
    }
  }

  private roundToTwo(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }
}