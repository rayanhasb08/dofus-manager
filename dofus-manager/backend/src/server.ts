import express from 'express';
import cors from 'cors';
import { ItemRepository } from './repositories/ItemRepository.js';
import { ItemService } from './services/ItemService.js';
import { createItemRoutes } from './routes/ItemRoutes.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();

  // Middlewares
  app.use(cors());
  app.use(express.json());

  // Initialize repository and service
  const itemRepository = new ItemRepository();
  await itemRepository.initialize();
  
  const itemService = new ItemService(itemRepository);

  // Routes
  app.use('/api/items', createItemRoutes(itemService));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
      error: 'Une erreur interne est survenue' 
    });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api/items`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});