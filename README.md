# 🎮 Dofus Manager - Craft & Forgemagie

Application de gestion de craft et forgemagie pour Dofus, avec calculs automatiques de rentabilité et statistiques détaillées.

## 📋 Fonctionnalités

- ✅ Ajout, modification et suppression d'items craftables
- 📊 Calculs automatiques :
  - Coût unitaire de craft
  - Investissement total
  - Bénéfice par item (avec taxes HDV de 4%)
  - Bénéfice total
  - Rendement en %
- 📈 Panel de statistiques globales
- 🔍 Filtres et tri avancés
- 💾 Sauvegarde permanente (JSON backend)
- 🎨 Thème sombre Dofus-like

## 🏗️ Architecture

### Backend (Node.js + Express + TypeScript)
```
backend/
├── src/
│   ├── models/         # Types et interfaces
│   ├── repositories/   # Pattern Repository (accès données)
│   ├── services/       # Logique métier
│   ├── routes/         # Routes API REST
│   ├── data/           # Stockage JSON
│   └── server.ts       # Point d'entrée
```

### Frontend (Alpine.js + Tailwind + TypeScript)
```
src/
├── types/              # Types TypeScript
├── services/           # Services API
├── stores/             # State management
├── main.ts             # Point d'entrée
└── style.css           # Styles personnalisés
```

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou pnpm

### Installation Backend

```bash
cd backend
npm install
```

### Installation Frontend

```bash
# À la racine du projet
npm install
```

## 💻 Développement

### 1. Démarrer le Backend (Terminal 1)

```bash
cd backend
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### 2. Démarrer le Frontend (Terminal 2)

```bash
# À la racine
npm run dev
```

L'application est accessible sur `http://localhost:5173`

## 🔧 API Endpoints

### Items

- `GET /api/items` - Liste tous les items avec calculs
- `GET /api/items/:id` - Récupère un item spécifique
- `POST /api/items` - Crée un nouvel item
- `PUT /api/items/:id` - Met à jour un item
- `DELETE /api/items/:id` - Supprime un item

### Statistiques

- `GET /api/items/stats` - Récupère les statistiques globales

### Exemple de requête POST

```json
{
  "name": "Anneau Brisach",
  "craftCost": 50000,
  "forgemageCost": 20000,
  "difficulty": "Moyen",
  "quantity": 5,
  "salePrice": 18000
}
```

## 📐 Formules de Calcul

### Coût Unitaire de Craft
```
coût_unitaire = (coût_craft + coût_forgemagie) / quantité
```

### Investissement Total
```
investissement = coût_craft + coût_forgemagie
```

### Bénéfice par Item
```
bénéfice_item = (prix_vente × 0.96) - coût_unitaire
```
*Note: 0.96 représente les 4% de taxes de l'hôtel de vente*

### Bénéfice Total
```
bénéfice_total = bénéfice_item × quantité
```

### Rendement
```
rendement = (prix_vente / coût_unitaire) × 100
```

## 🎨 Thème

Le thème utilise une palette de couleurs inspirée de Dofus :
- Couleurs primaires : Ambre/Or (#f59e0b, #d97706)
- Arrière-plan : Slate sombre (#0f172a, #020617)
- Accents : Vert (profit), Rouge (perte)

## 📦 Patterns de Conception Utilisés

### Backend
- **Repository Pattern** : Séparation de la logique d'accès aux données
- **Service Layer** : Logique métier centralisée
- **DTO Pattern** : Objets de transfert de données typés

### Frontend
- **Store Pattern** : Gestion d'état centralisée
- **Service Pattern** : Communication API isolée
- **Observer Pattern** : Réactivité Alpine.js

## 🔐 Validation

Le système valide automatiquement :
- Nom d'item non vide
- Coûts positifs ou nuls
- Quantité supérieure à 0
- Prix de vente positif ou nul

## 🛠️ Build Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
npm run build
npm run preview
```

## 📝 TODO / Améliorations Futures

- [ ] Authentification utilisateur
- [ ] Export Excel/CSV des données
- [ ] Graphiques de rentabilité
- [ ] Historique des modifications
- [ ] Mode multi-utilisateurs
- [ ] Notifications en temps réel
- [ ] PWA (Progressive Web App)

## 🤝 Contribution

Ce projet utilise :
- TypeScript pour le typage fort
- ESLint pour la qualité du code
- Prettier pour le formatage (optionnel)

## 📄 Licence

MIT

---

Développé avec ❤️ pour la communauté Dofus