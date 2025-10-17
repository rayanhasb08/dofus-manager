# 🏛️ Architecture du Projet

## Vue d'ensemble

Ce projet suit une architecture **modulaire et orientée objet** avec une séparation claire entre le backend et le frontend. Les patterns de conception utilisés garantissent la maintenabilité, la testabilité et l'extensibilité du code.

## 📦 Structure Globale

```
dofus-manager/
│
├── backend/                 # Serveur Node.js + Express
│   ├── src/
│   │   ├── models/         # Définitions de types et interfaces
│   │   ├── repositories/   # Accès aux données (Repository Pattern)
│   │   ├── services/       # Logique métier (Service Layer)
│   │   ├── routes/         # Routes API REST
│   │   ├── data/           # Stockage JSON persistant
│   │   └── server.ts       # Point d'entrée du serveur
│   └── package.json
│
├── src/                     # Application frontend
│   ├── types/              # Types TypeScript partagés
│   ├── services/           # Services de communication API
│   ├── stores/             # Gestion d'état (Store Pattern)
│   ├── main.ts             # Bootstrap Alpine.js
│   └── style.css           # Styles Tailwind + custom
│
├── public/                  # Assets statiques
├── index.html              # Point d'entrée HTML
└── vite.config.ts          # Configuration Vite
```

## 🎯 Backend - Architecture en Couches

### Layer 1: Models (Types & Interfaces)

**Fichier**: `backend/src/models/Item.ts`

**Responsabilité**: Définir les types de données et les contrats

```typescript
// Types de base
Item                    // Représentation d'un item en base
ItemCalculations        // Métriques calculées
ItemWithCalculations    // Item enrichi avec calculs
ItemStats              // Statistiques globales

// DTOs (Data Transfer Objects)
CreateItemDTO          // Données pour créer un item
UpdateItemDTO          // Données pour modifier un item
```

**Pattern**: **Value Object** et **DTO Pattern**

### Layer 2: Repository (Accès aux données)

**Fichier**: `backend/src/repositories/ItemRepository.ts`

**Responsabilité**: Gérer la persistance des données

```typescript
class ItemRepository {
  findAll()       // Lecture de tous les items
  findById()      // Lecture d'un item spécifique
  create()        // Création
  update()        // Mise à jour
  delete()        // Suppression
}
```

**Pattern**: **Repository Pattern**

**Avantages**:
- Abstraction de la source de données (actuellement JSON, facilement remplaçable par PostgreSQL/MongoDB)
- Centralisation de la logique d'accès aux données
- Facilite les tests unitaires (mock du repository)

### Layer 3: Services (Logique métier)

#### CalculatorService

**Fichier**: `backend/src/services/CalculatorService.ts`

**Responsabilité**: Tous les calculs liés aux items

```typescript
class CalculatorService {
  static calculateMetrics()        // Calcul complet des métriques
  static enrichItem()              // Enrichit un item avec calculs
  private static calculateUnitCraftCost()
  private static calculateTotalInvestment()
  private static calculateProfitPerItem()
  private static calculateTotalProfit()
  private static calculateYield()
}
```

**Pattern**: **Service Layer** + **Static Utility Class**

**Pourquoi static ?**: Les calculs sont purement fonctionnels (pas d'état), donc pas besoin d'instanciation.

#### ItemService

**Fichier**: `backend/src/services/ItemService.ts`

**Responsabilité**: Orchestration des opérations sur les items

```typescript
class ItemService {
  constructor(repository: ItemRepository)
  
  getAllItems()      // CRUD + enrichissement
  getItemById()
  createItem()
  updateItem()
  deleteItem()
  getStats()         // Calcul des statistiques globales
}
```

**Pattern**: **Service Layer** + **Facade Pattern**

**Avantages**:
- Centralise la logique métier
- Orchestre Repository + Calculator
- Validation des données
- Point d'entrée unique pour les routes

### Layer 4: Routes (API REST)

**Fichier**: `backend/src/routes/itemRoutes.ts`

**Responsabilité**: Définir les endpoints HTTP

```typescript
GET    /api/items          // Liste tous les items
GET    /api/items/stats    // Statistiques globales
GET    /api/items/:id      // Un item spécifique
POST   /api/items          // Créer un item
PUT    /api/items/:id      // Modifier un item
DELETE /api/items/:id      // Supprimer un item
```

**Pattern**: **Controller Pattern** (Express Router)

### Layer 5: Server (Bootstrap)

**Fichier**: `backend/src/server.ts`

**Responsabilité**: Initialisation et configuration du serveur

- Configuration des middlewares (CORS, JSON)
- Initialisation du Repository
- Montage des routes
- Gestion des erreurs
- Démarrage du serveur

## 🎨 Frontend - Architecture Réactive

### Types (Contrat Frontend)

**Fichier**: `src/types/Item.ts`

Miroir des types backend + types spécifiques au frontend:

```typescript
// Types métier (identiques au backend)
Item, ItemCalculations, ItemWithCalculations, ItemStats

// Types UI
SortField          // Champs triables
SortOrder          // asc | desc
FilterOptions      // Options de filtrage
```

### Services (Communication API)

**Fichier**: `src/services/ApiService.ts`

**Responsabilité**: Abstraction des appels HTTP

```typescript
class ApiService {
  constructor(baseUrl: string)
  
  getItems()         // GET /api/items
  getItem(id)        // GET /api/items/:id
  createItem(data)   // POST /api/items
  updateItem(data)   // PUT /api/items/:id
  deleteItem(id)     // DELETE /api/items/:id
  getStats()         // GET /api/items/stats
}
```

**Pattern**: **Service Pattern** + **Adapter Pattern**

**Avantages**:
- Centralise les appels API
- Gestion des erreurs unifiée
- Facilite le changement d'API (GraphQL, etc.)

### Store (Gestion d'état)

**Fichier**: `src/stores/ItemStore.ts`

**Responsabilité**: État centralisé de l'application

```typescript
class ItemStore {
  // État privé
  private items: ItemWithCalculations[]
  private stats: ItemStats
  private loading: boolean
  private error: string | null
  private sortField: SortField
  private sortOrder: SortOrder
  private filters: FilterOptions
  
  // Méthodes publiques
  getItems()                        // Lecture avec filtres/tri
  loadData()                        // Chargement depuis API
  createItem() / updateItem() / deleteItem()
  setSorting() / setFilters()
  
  // Méthode privée
  private applyFiltersAndSort()     // Logique de filtrage/tri
}
```

**Pattern**: **Store Pattern** + **Observer Pattern** (via Alpine.js)

**Avantages**:
- État centralisé et prévisible
- Logique de filtrage/tri réutilisable
- Séparation de la logique métier et de la vue

### Composant Alpine.js

**Fichier**: `src/main.ts`

**Responsabilité**: Bootstrap de l'application et définition du composant principal

```typescript
Alpine.data('itemManager', () => ({
  // État
  store: ItemStore
  showModal: boolean
  formData: CreateItemDTO
  
  // Lifecycle
  init()
  
  // Getters (computed)
  get items()
  get stats()
  
  // Actions
  openCreateModal() / openEditModal() / closeModal()
  submitForm() / deleteItem()
  sort() / updateFilters()
  
  // Formatters
  formatNumber() / formatKamas() / formatPercent()
  getDifficultyColor() / getProfitColor()
}))
```

**Pattern**: **Component Pattern** + **MVVM** (Model-View-ViewModel)

## 🔄 Flux de Données

### Lecture (GET)

```
User Action
    ↓
Alpine Component (init)
    ↓
ItemStore.loadData()
    ↓
ApiService.getItems() + getStats()
    ↓
HTTP GET /api/items, /api/items/stats
    ↓
Express Router
    ↓
ItemService.getAllItems() / getStats()
    ↓
ItemRepository.findAll()
    ↓
JSON File
    ↓
CalculatorService.enrichItem()
    ↓
Response → Store → Alpine → DOM Update
```

### Création (POST)

```
User submits form
    ↓
Alpine Component.submitForm()
    ↓
Validation
    ↓
ItemStore.createItem(formData)
    ↓
ApiService.createItem(data)
    ↓
HTTP POST /api/items
    ↓
ItemService.createItem()
    ↓
Validation business rules
    ↓
ItemRepository.create()
    ↓
JSON File (write)
    ↓
Reload complete data
    ↓
Response → Update UI
```

## 🎭 Patterns de Conception Utilisés

### Backend

| Pattern | Localisation | Objectif |
|---------|--------------|----------|
| **Repository** | ItemRepository | Abstraction de la persistance |
| **Service Layer** | ItemService, CalculatorService | Logique métier centralisée |
| **DTO** | CreateItemDTO, UpdateItemDTO | Contrats d'API clairs |
| **Facade** | ItemService | Simplifie l'orchestration |
| **Static Utility** | CalculatorService | Fonctions pures sans état |
| **Dependency Injection** | ItemService(repository) | Couplage faible |

### Frontend

| Pattern | Localisation | Objectif |
|---------|--------------|----------|
| **Store** | ItemStore | État centralisé |
| **Service** | ApiService | Abstraction HTTP |
| **Observer** | Alpine.js réactivité | Mise à jour automatique UI |
| **Component** | Alpine data() | Encapsulation composant |
| **Adapter** | ApiService | Adaptation API backend |

## 🔐 Principes SOLID Appliqués

### Single Responsibility (SRP)
- **CalculatorService**: Uniquement les calculs
- **ItemRepository**: Uniquement la persistance
- **ItemService**: Uniquement l'orchestration métier
- **ApiService**: Uniquement la communication HTTP

### Open/Closed (OCP)
- Facile d'ajouter de nouveaux calculs sans modifier le code existant
- Ajout de nouvelles routes sans toucher aux services

### Liskov Substitution (LSP)
- Le Repository pourrait être remplacé par une implémentation SQL sans changer le Service

### Interface Segregation (ISP)
- DTOs spécifiques (Create vs Update) plutôt qu'une interface massive

### Dependency Inversion (DIP)
- ItemService dépend de l'abstraction Repository, pas de l'implémentation concrète

## 🧪 Testabilité

L'architecture permet facilement de :

### Backend
```typescript
// Mock du repository
const mockRepo = {
  findAll: jest.fn().mockResolvedValue([...]),
  create: jest.fn()
}
const service = new ItemService(mockRepo)
```

### Frontend
```typescript
// Mock de l'API
const mockApi = {
  getItems: jest.fn().mockResolvedValue([...])
}
const store = new ItemStore(mockApi)
```

## 🚀 Extensions Futures

L'architecture permet facilement d'ajouter :

- **Authentification**: Middleware dans routes
- **WebSockets**: Service de notification
- **Cache Redis**: Layer entre Service et Repository
- **GraphQL**: Nouveau layer de routes
- **Tests E2E**: Séparation claire des responsabilités

## 📚 Ressources

- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Service Layer](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
