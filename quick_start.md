# 🚀 Guide de Démarrage Rapide

## Installation Express (5 minutes)

### 1. Cloner et installer les dépendances

```bash
# À la racine du projet
npm install

# Backend
cd backend
npm install
cd ..
```

### 2. Lancer l'application

#### Option A : Script automatique (Linux/Mac)

```bash
chmod +x dev.sh
./dev.sh
```

#### Option B : Manuellement (Windows/Linux/Mac)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 3. Accéder à l'application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 🎯 Premiers pas

### Ajouter votre premier item

1. Cliquez sur **"➕ Nouvel Item"**
2. Remplissez le formulaire :
   - **Nom** : Ex. "Anneau Brisach"
   - **Coût de Craft** : 50000 kamas
   - **Coût de Forgemagie** : 20000 kamas
   - **Difficulté** : Moyen
   - **Quantité** : 5
   - **Prix de Vente** : 18000 kamas
3. Cliquez sur **"Créer"**

### Utiliser des données d'exemple

Si vous voulez tester rapidement avec des données :

```bash
cd backend/src/data
cp items.example.json items.json
```

Puis redémarrez le backend.

## 📊 Fonctionnalités Principales

### Panel de Statistiques
- **Total Items** : Nombre d'items dans la base
- **Investissement Total** : Somme de tous les coûts
- **Bénéfice Total** : Profit total après taxes
- **Rendement Moyen** : Moyenne des rendements
- **Plus/Moins Rentable** : Items extrêmes

### Tableau Interactif
- **Tri** : Cliquez sur les en-têtes de colonnes
- **Filtres** :
  - 🔍 Recherche par nom
  - ⚔️ Filtre par difficulté
  - 📈 Rendement minimum
- **Actions** :
  - ✏️ Modifier un item
  - 🗑️ Supprimer un item

### Calculs Automatiques

Tous les calculs se font automatiquement :

- **Coût Unitaire** = (Craft + Forgemagie) / Quantité
- **Investissement** = Craft + Forgemagie
- **Profit/Item** = (Prix × 0.96) - Coût Unitaire *(4% de taxes HDV)*
- **Profit Total** = Profit/Item × Quantité
- **Rendement %** = (Prix / Coût Unitaire) × 100

## 🔧 Résolution de Problèmes

### Le backend ne démarre pas

```bash
# Vérifier que le port 3000 est libre
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Ou changer le port dans backend/src/server.ts
const PORT = 3001;  // Au lieu de 3000
```

### Le frontend ne trouve pas l'API

Vérifiez que le backend tourne sur le port 3000, sinon modifiez dans `src/services/ApiService.ts` :

```typescript
constructor(baseUrl: string = 'http://localhost:3001/api') {
  // Changez 3000 par votre port
}
```

### Erreur CORS

Si vous avez des erreurs CORS, vérifiez que le backend a bien le middleware CORS activé dans `backend/src/server.ts`.

### Les données ne se sauvegardent pas

Vérifiez que le dossier `backend/src/data/` existe et est accessible en écriture.

```bash
mkdir -p backend/src/data
chmod 755 backend/src/data
```

## 🎨 Personnalisation

### Changer les couleurs du thème

Éditez `src/style.css` :

```css
:root {
  --color-primary: #f59e0b;  /* Votre couleur primaire */
  --color-secondary: #d97706; /* Votre couleur secondaire */
}
```

### Modifier le taux de taxe HDV

Dans `backend/src/services/CalculatorService.ts` :

```typescript
private static readonly MARKET_TAX = 0.04; // Changez ici
```

### Ajouter des difficultés

Dans `backend/src/models/Item.ts` et `src/types/Item.ts` :

```typescript
export enum ForgemagieDifficulty {
  FACILE = 'Facile',
  MOYEN = 'Moyen',
  DIFFICILE = 'Difficile',
  EXTREME = 'Extrême'  // Nouvelle difficulté
}
```

## 📱 Utilisation Mobile

L'interface est responsive et fonctionne sur mobile. Pour un meilleur affichage :
- Faites glisser le tableau horizontalement
- Utilisez le mode paysage pour plus d'espace

## 🔐 Sécurité (Production)

Pour une utilisation en production :

1. **Variables d'environnement**

Créez `.env` dans backend/ :
```
PORT=3000
NODE_ENV=production
```

2. **CORS restrictif**

Dans `backend/src/server.ts` :
```typescript
app.use(cors({
  origin: 'https://votre-domaine.com'
}));
```

3. **Rate limiting**

Installez et configurez `express-rate-limit`

## 🧪 Test de l'API avec cURL

### Créer un item
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Item",
    "craftCost": 10000,
    "forgemageCost": 5000,
    "difficulty": "Facile",
    "quantity": 1,
    "salePrice": 20000
  }'
```

### Récupérer tous les items
```bash
curl http://localhost:3000/api/items
```

### Récupérer les stats
```bash
curl http://localhost:3000/api/items/stats
```

## 📚 Ressources Supplémentaires

- [Documentation Alpine.js](https://alpinejs.dev/)
- [Documentation Tailwind CSS](https://tailwindcss.com/)
- [Documentation Express](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 💡 Astuces

### Raccourcis Clavier (à venir)
- `Ctrl + N` : Nouvel item
- `Escape` : Fermer le modal

### Performance
- Le tri et les filtres sont optimisés pour des centaines d'items
- Les données sont rechargées automatiquement après chaque modification

### Backup des données
```bash
# Sauvegarder
cp backend/src/data/items.json backup-$(date +%Y%m%d).json

# Restaurer
cp backup-20251016.json backend/src/data/items.json
```

---

**Besoin d'aide ?** Consultez le README.md complet ou ouvrez une issue sur GitHub.