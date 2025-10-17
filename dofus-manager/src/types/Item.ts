export enum ForgemagieDifficulty {
  FACILE = 'Facile',
  MOYEN = 'Moyen',
  DIFFICILE = 'Difficile'
}

export interface Item {
  id: string;
  name: string;
  lotCost: number;
  forgemageCost: number;
  difficulty: ForgemagieDifficulty;
  quantity: number;
  salePrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface ItemCalculations {
  costPerItem: number;
  totalInvestment: number;
  profitPerItem: number;
  totalProfit: number;
  yield: number;
}

export interface ItemWithCalculations extends Item {
  calculations: ItemCalculations;
}

export interface ItemStats {
  totalItems: number;
  totalInvestment: number;
  totalProfit: number;
  averageYield: number;
  mostProfitable: ItemWithCalculations | null;
  leastProfitable: ItemWithCalculations | null;
}

export interface CreateItemDTO {
  name: string;
  lotCost: number;
  forgemageCost: number;
  difficulty: ForgemagieDifficulty;
  quantity: number;
  salePrice: number;
}

export interface UpdateItemDTO extends Partial<CreateItemDTO> {
  id: string;
}

export type SortField = 
  | 'name'
  | 'costPerItem'
  | 'totalInvestment'
  | 'profitPerItem'
  | 'totalProfit'
  | 'yield'
  | 'createdAt';

export type SortOrder = 'asc' | 'desc';

export interface FilterOptions {
  search: string;
  difficulty: ForgemagieDifficulty | 'all';
  minYield: number;
  maxYield: number;
}