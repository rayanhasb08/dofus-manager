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
    const costPerItem = this.calculateCostPerItem(
      item.lotCost,
      item.forgemageCost,
      item.quantity
    );

    const totalInvestment = this.calculateTotalInvestment(
      item.lotCost,
      item.forgemageCost
    );

    const profitPerItem = this.calculateProfitPerItem(
      item.salePrice,
      costPerItem
    );

    const totalProfit = this.calculateTotalProfit(
      profitPerItem,
      item.quantity
    );

    const yieldValue = this.calculateYield(
      item.salePrice,
      costPerItem
    );

    return {
      costPerItem: this.roundToTwo(costPerItem),
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
   * Coût par item = (Coût du lot + Coût de fm) / Quantité
   */
  private static calculateCostPerItem(
    lotCost: number,
    forgemageCost: number,
    quantity: number
  ): number {
    if (quantity <= 0) return 0;
    return (lotCost + forgemageCost) / quantity;
  }

  /**
   * Investissement total = Coût du lot + Coût de fm
   */
  private static calculateTotalInvestment(
    lotCost: number,
    forgemageCost: number
  ): number {
    return lotCost + forgemageCost;
  }

  /**
   * Bénéfice par item = (Prix de vente unitaire * 0.96) - Coût par item
   */
  private static calculateProfitPerItem(
    salePrice: number,
    costPerItem: number
  ): number {
    const priceAfterTax = salePrice * (1 - this.MARKET_TAX);
    return priceAfterTax - costPerItem;
  }

  /**
   * Bénéfice total = Bénéfice par item * Quantité
   */
  private static calculateTotalProfit(
    profitPerItem: number,
    quantity: number
  ): number {
    return profitPerItem * quantity;
  }

  /**
   * Rendement = Prix de vente unitaire / Coût par item
   * FORMULE MODIFIÉE : Sans appliquer les taxes
   */
  private static calculateYield(
    salePrice: number,
    costPerItem: number
  ): number {
    if (costPerItem <= 0) return 0;
    return salePrice / costPerItem;
  }

  /**
   * Arrondit à 2 décimales
   */
  private static roundToTwo(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }
}