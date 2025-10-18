/**
 * Fonctions utilitaires partagées pour le formatage et l'affichage
 */

/**
 * Formate un nombre avec séparateurs de milliers
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

/**
 * Formate un montant en Kamas
 */
export function formatKamas(num: number): string {
  const formatted = formatNumber(Math.round(num));
  return formatted + ' K';
}

/**
 * Formate un nombre en pourcentage avec 2 décimales
 */
export function formatPercent(num: number): string {
  return num.toFixed(2);
}

/**
 * Retourne la classe CSS pour le badge de difficulté
 */
export function getDifficultyBadgeClass(difficulty: string): string {
  switch (difficulty) {
    case 'Facile':
      return 'badge-success';
    case 'Moyen':
      return 'badge-warning';
    case 'Difficile':
      return 'badge-error';
    default:
      return '';
  }
}

/**
 * Retourne la couleur CSS pour la difficulté
 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Facile':
      return 'bg-emerald-500';
    case 'Moyen':
      return 'bg-amber-500';
    case 'Difficile':
      return 'bg-red-500';
    default:
      return 'bg-slate-500';
  }
}

/**
 * Retourne la couleur CSS pour un rang dans un classement
 */
export function getRankColor(index: number): string {
  if (index === 0) return 'bg-gradient-to-br from-yellow-500 to-yellow-600';
  if (index === 1) return 'bg-gradient-to-br from-slate-400 to-slate-500';
  if (index === 2) return 'bg-gradient-to-br from-orange-600 to-orange-700';
  return 'bg-slate-700';
}