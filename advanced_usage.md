# 🚀 Utilisation Avancée

## Personnalisation et Extensions

### 1. Ajouter un nouveau champ aux items

#### Backend

**1. Mettre à jour le modèle** (`backend/src/models/Item.ts`):
```typescript
export interface Item {
  id: string;
  name: string;
  craftCost: number;
  forgemageCost: number;
  difficulty: ForgemagieDifficulty;
  quantity: number;
  salePrice: number;
  // ✨ Nouveau champ
  category: string;  // Ex: "Anneau", "Amulette", "Arme"
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemDTO {
  name: string;
  craftCost: number;
  forgemageCost: number;
  difficulty: ForgemagieDifficulty;
  quantity: number;
  salePrice: number;
  category: string;  // ✨ Ajout ici aussi
}
```

**2. Mettre à jour la validation** (`backend/src/services/ItemService.ts`):
```typescript
private validateItemData(data: Partial<CreateItemDTO>): void {
  // ... validations existantes ...
  
  if (data.category !== undefined && data.category.trim() === '') {
    throw new Error('La catégorie est requise');
  }
}
```

#### Frontend

**1. Mettre à jour les types** (`src/types/Item.ts`):
```typescript
export interface Item {
  // ... champs existants ...
  category: string;  // ✨ Nouveau champ
}
```

**2. Ajouter le champ au formulaire** (`index.html`):
```html
<div>
  <label class="block text-amber-300 font-medium mb-2">📂 Catégorie *</label>
  <select 
    x-model="formData.category"
    class="w-full px-4 py-3 bg-slate-800 border border-amber-600/30 rounded-lg"
  >
    <option value="Anneau">Anneau</option>
    <option value="Amulette">Amulette</option>
    <option value="Arme">Arme</option>
    <option value="Bouclier">Bouclier</option>
  </select>
</div>
```

**3. Ajouter une colonne au tableau**:
```html
<th class="px-6 py-4 text-center text-amber-400 font-bold">Catégorie</th>
<!-- ... -->
<td class="px-6 py-4 text-center text-amber-300" x-text="item.category"></td>
```

### 2. Ajouter un nouveau calcul

**Exemple**: Ajouter un calcul de "Temps estimé de vente"

#### Backend (`backend/src/services/CalculatorService.ts`):

```typescript
export interface ItemCalculations {
  // ... calculs existants ...
  estimatedSaleTime: number;  // en jours
}

class CalculatorService {
  static calculateMetrics(item: Item): ItemCalculations {
    // ... calculs existants ...
    
    const estimatedSaleTime = this.calculateSaleTime(
      item.salePrice,
      item.difficulty
    );

    return {
      // ... métriques existantes ...
      estimatedSaleTime: this.roundToTwo(estimatedSaleTime)
    };
  }

  private static calculateSaleTime(
    salePrice: number,
    difficulty: ForgemagieDifficulty
  ): number {
    // Logique personnalisée
    let baseTime = 7; // 7 jours de base
    
    // Prix élevé = vente plus lente
    if (salePrice > 100000) baseTime += 5;
    else if (salePrice > 50000) baseTime += 2;
    
    // Difficulté haute = demande plus faible
    if (difficulty === ForgemagieDifficulty.DIFFICILE) baseTime += 3;
    
    return baseTime;
  }
}
```

### 3. Ajouter un filtre personnalisé

**Exemple**: Filtrer par rentabilité (profitable ou non)

#### Frontend (`src/stores/ItemStore.ts`):

```typescript
export interface FilterOptions {
  search: string;
  difficulty: ForgemagieDifficulty | 'all';
  minYield: number;
  maxYield: number;
  profitableOnly: boolean;  // ✨ Nouveau filtre
}

private applyFiltersAndSort(items: ItemWithCalculations[]): ItemWithCalculations[] {
  let filtered = [...items];

  // ... filtres existants ...

  // ✨ Nouveau filtre
  if (this.filters.profitableOnly) {
    filtered = filtered.filter(item => 
      item.calculations.profitPerItem > 0
    );
  }

  // ... tri ...
  return filtered;
}
```

#### UI (`index.html`):

```html
<div>
  <label class="flex items-center gap-2 text-amber-300">
    <input 
      type="checkbox" 
      x-model="filters.profitableOnly"
      @change="updateFilters({ profitableOnly: $event.target.checked })"
      class="w-5 h-5 bg-slate-800 border-amber-600/30 rounded"
    >
    💰 Rentables uniquement
  </label>
</div>
```

### 4. Exporter les données en CSV

#### Frontend (`src/main.ts`):

```typescript
Alpine.data('itemManager', () => ({
  // ... code existant ...

  exportToCSV() {
    const items = this.store.getItems();
    
    const headers = [
      'Nom',
      'Coût Craft',
      'Coût Forgemagie',
      'Quantité',
      'Prix Vente',
      'Coût Unitaire',
      'Profit/Item',
      'Profit Total',
      'Rendement %'
    ];
    
    const rows = items.map(item => [
      item.name,
      item.craftCost,
      item.forgemageCost,
      item.quantity,
      item.salePrice,
      item.calculations.unitCraftCost,
      item.calculations.profitPerItem,
      item.calculations.totalProfit,
      item.calculations.yield
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dofus-items-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}));
```

#### Bouton dans l'UI:

```html
<button 
  @click="exportToCSV"
  class="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg"
>
  📥 Exporter CSV
</button>
```

### 5. Changer la base de données (JSON → MongoDB)

#### Installation:

```bash
cd backend
npm install mongodb
```

#### Nouveau Repository (`backend/src/repositories/MongoItemRepository.ts`):

```typescript
import { MongoClient, Db, Collection } from 'mongodb';
import { Item, CreateItemDTO, UpdateItemDTO } from '../models/Item.js';

export class MongoItemRepository {
  private db: Db;
  private collection: Collection<Item>;

  constructor(connectionString: string) {
    const client = new MongoClient(connectionString);
    this.db = client.db('dofus-manager');
    this.collection = this.db.collection('items');
  }

  async initialize(): Promise<void> {
    // Créer des index si nécessaire
    await this.collection.createIndex({ name: 1 });
  }

  async findAll(): Promise<Item[]> {
    return await this.collection.find({}).toArray();
  }

  async findById(id: string): Promise<Item | null> {
    return await this.collection.findOne({ id });
  }

  async create(data: CreateItemDTO): Promise<Item> {
    const newItem: Item = {
      id: this.generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.collection.insertOne(newItem);
    return newItem;
  }

  async update(data: UpdateItemDTO): Promise<Item | null> {
    const { id, ...updateData } = data;
    
    const result = await this.collection.findOneAndUpdate(
      { id },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date().toISOString() 
        } 
      },
      { returnDocument: 'after' }
    );

    return result.value;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  private generateId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

#### Mise à jour du server (`backend/src/server.ts`):

```typescript
import { MongoItemRepository } from './repositories/MongoItemRepository.js';

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Choisir le repository selon l'environnement
  const useMongoDb = process.env.USE_MONGODB === 'true';
  
  let itemRepository;
  if (useMongoDb) {
    const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
    itemRepository = new MongoItemRepository(mongoUrl);
  } else {
    itemRepository = new ItemRepository();
  }
  
  await itemRepository.initialize();
  
  const itemService = new ItemService(itemRepository);
  app.use('/api/items', createItemRoutes(itemService));
  
  // ... reste du code
}
```

### 6. Ajouter une authentification simple

#### Backend - Middleware Auth (`backend/src/middleware/auth.ts`):

```typescript
import { Request, Response, NextFunction } from 'express';

export function simpleAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  
  next();
}
```

#### Application du middleware:

```typescript
import { simpleAuth } from './middleware/auth.js';

// Protéger toutes les routes items
app.use('/api/items', simpleAuth, createItemRoutes(itemService));
```

#### Frontend - Ajout de l'API Key (`src/services/ApiService.ts`):

```typescript
export class ApiService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    baseUrl: string = 'http://localhost:3000/api',
    apiKey: string = 'votre-cle-api'
  ) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey
    };
  }

  async getItems(): Promise<ItemWithCalculations[]> {
    const response = await fetch(`${this.baseUrl}/items`, {
      headers: this.getHeaders()
    });
    // ... reste du code
  }
  
  // Mettre à jour toutes les méthodes avec getHeaders()
}
```

### 7. Ajouter des graphiques (Recharts)

#### Installation:

```bash
npm install recharts
```

#### Composant de graphique (`src/components/ProfitChart.ts`):

```typescript
// À ajouter dans main.ts
Alpine.data('profitChart', () => ({
  chartData: [],

  init() {
    this.prepareChartData();
  },

  prepareChartData() {
    const items = this.$root.store.getItems();
    
    this.chartData = items.map(item => ({
      name: item.name.substring(0, 15), // Limite la longueur
      profit: item.calculations.totalProfit,
      yield: item.calculations.yield
    })).slice(0, 10); // Top 10
  }
}));
```

#### HTML avec Recharts:

```html
<div x-data="profitChart" class="bg-slate-900/50 rounded-xl p-6 mt-6">
  <h3 class="text-xl font-bold text-amber-400 mb-4">📊 Top 10 - Profits</h3>
  <div id="profit-chart"></div>
</div>

<script type="module">
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { createRoot } from 'react-dom/client';
import React from 'react';

Alpine.data('profitChart', () => ({
  init() {
    const items = Alpine.store('itemManager').getItems();
    const data = items.slice(0, 10).map(item => ({
      name: item.name,
      profit: item.calculations.totalProfit
    }));

    const root = createRoot(document.getElementById('profit-chart'));
    root.render(
      React.createElement(ResponsiveContainer, { width: '100%', height: 300 },
        React.createElement(BarChart, { data },
          React.createElement(XAxis, { dataKey: 'name' }),
          React.createElement(YAxis),
          React.createElement(Tooltip),
          React.createElement(Bar, { dataKey: 'profit', fill: '#f59e0b' })
        )
      )
    );
  }
}));
</script>
```

### 8. Ajouter un système de notifications

#### Service de notifications (`src/services/NotificationService.ts`):

```typescript
type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
}

export class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Set<Function> = new Set();

  show(type: NotificationType, message: string, duration = 3000): void {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      duration
    };

    this.notifications.push(notification);
    this.notifyListeners();

    setTimeout(() => {
      this.dismiss(notification.id);
    }, duration);
  }

  dismiss(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  subscribe(listener: Function): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}
```

#### Intégration dans le store:

```typescript
import { NotificationService } from '../services/NotificationService';

export class ItemStore {
  private notificationService = new NotificationService();

  async createItem(data: CreateItemDTO): Promise<void> {
    try {
      await this.apiService.createItem(data);
      await this.loadData();
      this.notificationService.show('success', '✅ Item créé avec succès !');
    } catch (err: any) {
      this.error = err.message;
      this.notificationService.show('error', `❌ ${err.message}`);
      throw err;
    }
  }
}
```

#### Composant de notification (HTML):

```html
<div 
  x-data="notificationManager"
  class="fixed top-4 right-4 z-50 space-y-2"
>
  <template x-for="notif in notifications" :key="notif.id">
    <div 
      x-transition
      class="px-6 py-4 rounded-lg shadow-xl border-2 max-w-sm"
      :class="{
        'bg-green-900 border-green-500': notif.type === 'success',
        'bg-red-900 border-red-500': notif.type === 'error',
        'bg-blue-900 border-blue-500': notif.type === 'info',
        'bg-yellow-900 border-yellow-500': notif.type === 'warning'
      }"
    >
      <p class="text-white" x-text="notif.message"></p>
    </div>
  </template>
</div>
```

### 9. Mode sombre/clair dynamique

#### Store de thème (`src/stores/ThemeStore.ts`):

```typescript
export class ThemeStore {
  private isDark: boolean = true;

  constructor() {
    // Récupérer la préférence sauvegardée
    const saved = localStorage.getItem('theme');
    this.isDark = saved ? saved === 'dark' : true;
    this.apply();
  }

  toggle(): void {
    this.isDark = !this.isDark;
    this.apply();
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
  }

  getTheme(): 'dark' | 'light' {
    return this.isDark ? 'dark' : 'light';
  }

  private apply(): void {
    if (this.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
```

#### Bouton de toggle:

```html
<button 
  @click="themeStore.toggle()"
  class="p-2 bg-slate-800 rounded-lg"
>
  <span x-show="themeStore.getTheme() === 'dark'">🌙</span>
  <span x-show="themeStore.getTheme() === 'light'">☀️</span>
</button>
```

### 10. Recherche en temps réel avec debounce

#### Fonction utilitaire (`src/utils/debounce.ts`):

```typescript
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

#### Utilisation dans le composant:

```typescript
import { debounce } from './utils/debounce';

Alpine.data('itemManager', () => ({
  searchDebounced: null,

  init() {
    // Créer une version debouncée de la recherche
    this.searchDebounced = debounce((value) => {
      this.store.setFilters({ search: value });
    }, 300); // 300ms de délai
  },

  handleSearch(event) {
    this.searchDebounced(event.target.value);
  }
}));
```

```html
<input 
  type="text"
  @input="handleSearch($event)"
  placeholder="Recherche..."
>
```

## 🔧 Configuration Avancée

### Variables d'environnement

Créez `.env` à la racine et `backend/.env`:

**Backend `.env`**:
```env
PORT=3000
NODE_ENV=development
API_KEY=votre-cle-secrete-ici
USE_MONGODB=false
MONGODB_URL=mongodb://localhost:27017
CORS_ORIGIN=http://localhost:5173
```

**Frontend**: Utiliser Vite env avec `import.meta.env`

```typescript
const apiService = new ApiService(
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  import.meta.env.VITE_API_KEY
);
```

### Docker Compose

Créez `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./backend/src/data:/app/src/data

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

## 📱 Progressive Web App (PWA)

### Service Worker basique

Créez `public/sw.js`:

```javascript
const CACHE_NAME = 'dofus-manager-v1';
const urlsToCache = [
  '/',
  '/src/main.ts',
  '/src/style.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

### Manifest

Créez `public/manifest.json`:

```json
{
  "name": "Dofus Manager",
  "short_name": "Dofus",
  "description": "Gestion de craft et forgemagie",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#f59e0b",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Ajoutez dans `index.html`:

```html
<link rel="manifest" href="/manifest.json">
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
</script>
```

---

## 🎓 Ressources Supplémentaires

- [Alpine.js Advanced](https://alpinejs.dev/advanced/reactivity)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [REST API Design](https://restfulapi.net/)

Ces exemples montrent la flexibilité de l'architecture. N'hésitez pas à les adapter selon vos besoins ! 🚀