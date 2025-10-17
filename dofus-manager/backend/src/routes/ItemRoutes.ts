import { Router, Request, Response } from 'express';
import { ItemService } from '../services/ItemService.js';
import { CreateItemDTO, UpdateItemDTO } from '../models/Item.js';

export function createItemRoutes(itemService: ItemService): Router {
  const router = Router();

  /**
   * GET /api/items - Récupère tous les items
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const items = await itemService.getAllItems();
      res.json(items);
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des items' 
      });
    }
  });

  /**
   * GET /api/items/stats - Récupère les statistiques
   */
  router.get('/stats', async (req: Request, res: Response) => {
    try {
      const stats = await itemService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des statistiques' 
      });
    }
  });

  /**
   * GET /api/items/:id - Récupère un item par ID
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const item = await itemService.getItemById(req.params.id);
      
      if (!item) {
        return res.status(404).json({ 
          error: 'Item non trouvé' 
        });
      }
      
      res.json(item);
    } catch (error) {
      console.error('Error fetching item:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération de l\'item' 
      });
    }
  });

  /**
   * POST /api/items - Crée un nouvel item
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const data: CreateItemDTO = req.body;
      const item = await itemService.createItem(data);
      res.status(201).json(item);
    } catch (error: any) {
      console.error('Error creating item:', error);
      res.status(400).json({ 
        error: error.message || 'Erreur lors de la création de l\'item' 
      });
    }
  });

  /**
   * PUT /api/items/:id - Met à jour un item
   */
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const data: UpdateItemDTO = {
        id: req.params.id,
        ...req.body
      };
      
      const item = await itemService.updateItem(data);
      
      if (!item) {
        return res.status(404).json({ 
          error: 'Item non trouvé' 
        });
      }
      
      res.json(item);
    } catch (error: any) {
      console.error('Error updating item:', error);
      res.status(400).json({ 
        error: error.message || 'Erreur lors de la mise à jour de l\'item' 
      });
    }
  });

  /**
   * DELETE /api/items/:id - Supprime un item
   */
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const success = await itemService.deleteItem(req.params.id);
      
      if (!success) {
        return res.status(404).json({ 
          error: 'Item non trouvé' 
        });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la suppression de l\'item' 
      });
    }
  });

  return router;
}
