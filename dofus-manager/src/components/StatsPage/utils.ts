import { ItemWithCalculations } from '../../types/Item';

/**
 * Calcule les statistiques de répartition par difficulté
 */
export function getDifficultyStats(items: ItemWithCalculations[]) {
  const total = items.length;
  const stats: Record<string, number> = {
    'Facile': 0,
    'Moyen': 0,
    'Difficile': 0
  };
  
  items.forEach((item) => {
    stats[item.difficulty]++;
  });

  return Object.entries(stats).map(([difficulty, count]) => ({
    difficulty,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }));
}

/**
 * Compte les items rentables ou en perte
 */
export function getProfitableCount(items: ItemWithCalculations[], profitable: boolean): number {
  return items.filter((item) => 
    profitable ? item.calculations.totalProfit > 0 : item.calculations.totalProfit <= 0
  ).length;
}

/**
 * Calcule le taux de réussite (% d'items rentables)
 */
export function getSuccessRate(items: ItemWithCalculations[]): number {
  if (items.length === 0) return 0;
  const profitable = getProfitableCount(items, true);
  return Math.round((profitable / items.length) * 100);
}

/**
 * Calcule le coût moyen par item
 */
export function getAverageCostPerItem(items: ItemWithCalculations[]): number {
  if (items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + item.calculations.costPerItem, 0);
  return total / items.length;
}

/**
 * Calcule le bénéfice moyen par item
 */
export function getAverageProfitPerItem(items: ItemWithCalculations[]): number {
  if (items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + item.calculations.profitPerItem, 0);
  return total / items.length;
}

/**
 * Retourne le top N items par bénéfice total
 */
export function getTopItemsByProfit(items: ItemWithCalculations[], limit: number): ItemWithCalculations[] {
  return [...items]
    .sort((a, b) => b.calculations.totalProfit - a.calculations.totalProfit)
    .slice(0, limit);
}

/**
 * Retourne le top N items par rendement
 */
export function getTopItemsByYield(items: ItemWithCalculations[], limit: number): ItemWithCalculations[] {
  return [...items]
    .sort((a, b) => b.calculations.yield - a.calculations.yield)
    .slice(0, limit);
}

/**
 * Formate le pourcentage de profit par rapport à l'investissement
 */
export function formatProfitPercent(profit: number, investment: number): string {
  if (investment === 0) return '+0.00%';
  const percent = (profit / investment) * 100;
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}% du capital`;
}