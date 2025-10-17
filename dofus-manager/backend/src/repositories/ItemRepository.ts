import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Item, CreateItemDTO, UpdateItemDTO } from '../models/Item.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Repository pour la persistance des items
 * Pattern: Repository Pattern
 */
export class ItemRepository {
  private readonly dataPath: string;
  private items: Item[] = [];

  constructor(dataPath: string = path.join(__dirname, '../data/items.json')) {
    this.dataPath = dataPath;
  }

  /**
   * Initialise le repository et charge les données
   */
  async initialize(): Promise<void> {
    try {
      await this.ensureDataFileExists();
      await this.loadItems();
    } catch (error) {
      console.error('Error initializing repository:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les items
   */
  async findAll(): Promise<Item[]> {
    return [...this.items];
  }

  /**
   * Récupère un item par ID
   */
  async findById(id: string): Promise<Item | null> {
    const item = this.items.find(item => item.id === id);
    return item || null;
  }

  /**
   * Crée un nouvel item
   */
  async create(data: CreateItemDTO): Promise<Item> {
    const newItem: Item = {
      id: this.generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.items.push(newItem);
    await this.saveItems();
    
    return newItem;
  }

  /**
   * Met à jour un item existant
   */
  async update(data: UpdateItemDTO): Promise<Item | null> {
    const index = this.items.findIndex(item => item.id === data.id);
    
    if (index === -1) {
      return null;
    }

    const { id, ...updateData } = data;
    
    this.items[index] = {
      ...this.items[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await this.saveItems();
    
    return this.items[index];
  }

  /**
   * Supprime un item
   */
  async delete(id: string): Promise<boolean> {
    const initialLength = this.items.length;
    this.items = this.items.filter(item => item.id !== id);
    
    if (this.items.length < initialLength) {
      await this.saveItems();
      return true;
    }
    
    return false;
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sauvegarde les items dans le fichier JSON
   */
  private async saveItems(): Promise<void> {
    try {
      await fs.writeFile(
        this.dataPath,
        JSON.stringify(this.items, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Error saving items:', error);
      throw error;
    }
  }

  /**
   * Charge les items depuis le fichier JSON
   */
  private async loadItems(): Promise<void> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      this.items = JSON.parse(data);
    } catch (error) {
      // Si le fichier n'existe pas ou est vide, on commence avec un tableau vide
      this.items = [];
    }
  }

  /**
   * S'assure que le fichier de données existe
   */
  private async ensureDataFileExists(): Promise<void> {
    try {
      const dir = path.dirname(this.dataPath);
      await fs.mkdir(dir, { recursive: true });
      
      try {
        await fs.access(this.dataPath);
      } catch {
        // Le fichier n'existe pas, on le crée
        await fs.writeFile(this.dataPath, '[]', 'utf-8');
      }
    } catch (error) {
      console.error('Error ensuring data file exists:', error);
      throw error;
    }
  }
}
