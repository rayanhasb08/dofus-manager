import { Item, ItemCalculations, ItemWithCalculations } from '../models/Item.js';

/**
 * Service responsable de tous les calculs liés aux items
 * Pattern: Service Layer
 */
export class CalculatorService {
  private static readonly MARKET_TAX = 0.04; // 4% de taxes

  /**
   * Calcule toutes les métriques pour un item
   */
  static calculateMetrics(item: Item): ItemCalculations {
    const unitCraftCost = this.calculateUnitCraftCost(
      item.craftCost,
      item.forgemageCost,
      item.quantity
    );

    const totalInvestment = this.calculateTotalInvestment(
      item.craftCost,
      item.forgemageCost
    );

    const profitPerItem = this.calculateProfitPerItem(
      item.salePrice,
      unitCraftCost
    );

    const totalProfit = this.calculateTotalProfit(
      profitPerItem,
      item.quantity
    );

    const yieldValue = this.calculateYield(
      item.salePrice,
      unitCraftCost
    );

    return {
      unitCraftCost: this.roundToTwo(unitCraftCost),
      totalInvestment: this.roundToTwo(totalInvestment),
      profitPerItem: this.roundToTwo(profitPerItem),
      totalProfit: this.roundToTwo(totalProfit),
      yield: this.roundToTwo(yieldValue)
    };
  }

  /**
   * Enrichit un item avec ses calculs
   */
  static enrichItem(item: Item): ItemWithCalculations {
    return {
      ...item,
      calculations: this.calculateMetrics(item)
    };
  }

  /**
   * Coût unitaire = (coût craft + coût forgemagie) / quantité
   */
  private static calculateUnitCraftCost(
    craftCost: number,
    forgemageCost: number,
    quantity: number
  ): number {
    if (quantity <= 0) return 0;
    return (craftCost + forgemageCost) / quantity;
  }

  /**
   * Investissement total = coût craft + coût forgemagie
   */
  private static calculateTotalInvestment(
    craftCost: number,
    forgemageCost: number
  ): number {
    return craftCost + forgemageCost;
  }

  /**
   * Bénéfice par item = (prix vente * 0.96) - coût unitaire
   */
  private static calculateProfitPerItem(
    salePrice: number,
    unitCraftCost: number
  ): number {
    const priceAfterTax = salePrice * (1 - this.MARKET_TAX);
    return priceAfterTax - unitCraftCost;
  }

  /**
   * Bénéfice total = bénéfice par item * quantité
   */
  private static calculateTotalProfit(
    profitPerItem: number,
    quantity: number
  ): number {
    return profitPerItem * quantity;
  }

  /**
   * Rendement = prix vente / coût unitaire
   */
  private static calculateYield(
    salePrice: number,
    unitCraftCost: number
  ): number {
    if (unitCraftCost <= 0) return 0;
    return (salePrice / unitCraftCost) * 100;
  }

  /**
   * Arrondit à 2 décimales
   */
  private static roundToTwo(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }
}
