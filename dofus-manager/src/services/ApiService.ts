import { 
  ItemWithCalculations, 
  ItemStats, 
  CreateItemDTO, 
  UpdateItemDTO 
} from '../types/Item';

/**
 * Service pour communiquer avec l'API backend
 * Pattern: Service Layer
 */
export class ApiService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Récupère tous les items
   */
  async getItems(): Promise<ItemWithCalculations[]> {
    const response = await fetch(`${this.baseUrl}/items`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des items');
    }
    return response.json();
  }

  /**
   * Récupère un item par ID
   */
  async getItem(id: string): Promise<ItemWithCalculations> {
    const response = await fetch(`${this.baseUrl}/items/${id}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'item');
    }
    return response.json();
  }

  /**
   * Crée un nouvel item
   */
  async createItem(data: CreateItemDTO): Promise<ItemWithCalculations> {
    const response = await fetch(`${this.baseUrl}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la création de l\'item');
    }

    return response.json();
  }

  /**
   * Met à jour un item
   */
  async updateItem(data: UpdateItemDTO): Promise<ItemWithCalculations> {
    const { id, ...updateData } = data;
    const response = await fetch(`${this.baseUrl}/items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour de l\'item');
    }

    return response.json();
  }

  /**
   * Supprime un item
   */
  async deleteItem(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/items/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de l\'item');
    }
  }

  /**
   * Récupère les statistiques
   */
  async getStats(): Promise<ItemStats> {
    const response = await fetch(`${this.baseUrl}/items/stats`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }
    return response.json();
  }
}