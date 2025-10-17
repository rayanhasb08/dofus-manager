export enum ForgemagieDifficulty {
  FACILE = 'Facile',
  MOYEN = 'Moyen',
  DIFFICILE = 'Difficile'
}

export interface Item {
  id: string;
  name: string;
  lotCost: number; // Coût du lot
  forgemageCost: number; // Coût de fm
  difficulty: ForgemagieDifficulty;
  quantity: number;
  salePrice: number; // Prix de vente unitaire
  createdAt: string;
  updatedAt: string;
}

export interface ItemCalculations {
  costPerItem: number; // Coût par item
  totalInvestment: number; // Investissement total
  profitPerItem: number; // Bénéfice par item
  totalProfit: number; // Bénéfice total
  yield: number; // Rendement
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