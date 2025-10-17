# ✅ Checklist d'Installation

## 📋 Structure des fichiers à créer

Voici tous les fichiers que tu dois créer pour que le projet fonctionne :

### Racine du projet
```
dofus-manager/
├── [ ] package.json (déjà existant - à garder)
├── [ ] tsconfig.json
├── [ ] vite.config.ts
├── [ ] index.html
├── [ ] .gitignore
├── [ ] dev.sh (optionnel - Linux/Mac)
├── [ ] README.md
├── [ ] QUICKSTART.md
├── [ ] ARCHITECTURE.md
├── [ ] ADVANCED_USAGE.md
└── [ ] INSTALLATION_CHECKLIST.md (ce fichier)
```

### Dossier .vscode/
```
.vscode/
├── [ ] settings.json
└── [ ] extensions.json
```

### Dossier src/
```
src/
├── [ ] main.ts
├── [ ] style.css
├── types/
│   └── [ ] Item.ts
├── services/
│   └── [ ] ApiService.ts
└── stores/
    └── [ ] ItemStore.ts
```

### Dossier backend/
```
backend/
├── [ ] package.json
├── [ ] tsconfig.json
└── src/
    ├── [ ] server.ts
    ├── models/
    │   └── [ ] Item.ts
    ├── repositories/
    │   └── [ ] ItemRepository.ts
    ├── services/
    │   ├── [ ] CalculatorService.ts
    │   └── [ ] ItemService.ts
    ├── routes/
    │   └── [ ] itemRoutes.ts
    └── data/
        ├── [ ] .gitkeep
        └── [ ] items.example.json
```

## 🔧 Étapes d'Installation

### Étape 1: Préparer les dossiers
```bash
# Créer la structure backend
mkdir -p backend/src/{models,repositories,services,routes,data}

# Créer la structure frontend
mkdir -p src/{types,services,stores}
mkdir -p .vscode
```

### Étape 2: Copier les fichiers
- ✅ Copie tous les fichiers depuis les artifacts que je t'ai fournis
- ✅ Place-les aux bons emplacements selon l'arborescence ci-dessus

### Étape 3: Installer les dépendances

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
# À la racine
npm install
```

### Étape 4: Vérifier les fichiers critiques

**Backend - Vérifier que ces fichiers existent:**
- [ ] `backend/package.json` - Dépendances backend
- [ ] `backend/tsconfig.json` - Config TypeScript backend
- [ ] `backend/src/server.ts` - Point d'entrée
- [ ] `backend/src/data/.gitkeep` - Dossier de données

**Frontend - Vérifier que ces fichiers existent:**
- [ ] `package.json` - Dépendances frontend (déjà existant)
- [ ] `tsconfig.json` - Config TypeScript frontend
- [ ] `vite.config.ts` - Config Vite
- [ ] `index.html` - Page principale
- [ ] `src/main.ts` - Point d'entrée Alpine
- [ ] `src/style.css` - Styles personnalisés

### Étape 5: Tester le Backend

```bash
cd backend
npm run dev
```

**✅ Vérifications:**
- Le serveur démarre sans erreur
- Message: `🚀 Server running on http://localhost:3000`
- Tester: `curl http://localhost:3000/health`
- Doit retourner: `{"status":"ok","timestamp":"..."}`

### Étape 6: Tester l'API

```bash
# Dans un autre terminal
# Créer un item de test
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

# Récupérer tous les items
curl http://localhost:3000/api/items

# Récupérer les stats
curl http://localhost:3000/api/items/stats
```

**✅ Vérifications:**
- La création retourne l'item avec un ID
- GET /api/items retourne un tableau
- GET /api/items/stats retourne les statistiques
- Le fichier `backend/src/data/items.json` a été créé

### Étape 7: Tester le Frontend

```bash
# À la racine, dans un nouveau terminal
npm run dev
```

**✅ Vérifications:**
- Le serveur Vite démarre
- S'ouvre automatiquement sur `http://localhost:5173`
- La page se charge sans erreur dans la console
- Le titre "Dofus Manager" est visible
- Le thème sombre est appliqué

### Étape 8: Test end-to-end

**Dans l'interface web:**
1. [ ] Cliquer sur "➕ Nouvel Item"
2. [ ] Remplir le formulaire:
   - Nom: "Test UI"
   - Coût Craft: 50000
   - Coût Forgemagie: 20000
   - Difficulté: Moyen
   - Quantité: 5
   - Prix Vente: 18000
3. [ ] Cliquer "Créer"
4. [ ] Vérifier que l'item apparaît dans le tableau
5. [ ] Vérifier que les statistiques sont mises à jour
6. [ ] Tester le tri en cliquant sur une colonne
7. [ ] Tester la recherche
8. [ ] Modifier l'item (icône ✏️)
9. [ ] Supprimer l'item (icône 🗑️)

## 🐛 Résolution de Problèmes

### Backend ne démarre pas

**Erreur: "Cannot find module"**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

**Erreur: "Port 3000 already in use"**
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Frontend ne se connecte pas au backend

**Vérifier dans la console du navigateur:**
- Erreur CORS? → Vérifier que CORS est activé dans `backend/src/server.ts`
- Erreur 404? → Vérifier que le backend tourne sur le port 3000
- Erreur réseau? → Vérifier l'URL dans `src/services/ApiService.ts`

### TypeScript errors

```bash
# Nettoyer et réinstaller
npm run build
```

Si erreurs persistent:
```bash
# Vérifier les versions
npx tsc --version  # Doit être ~5.9.3
```

### Styles ne s'appliquent pas

**Vérifier:**
- [ ] Tailwind CSS est bien installé (`@tailwindcss/vite` dans package.json)
- [ ] `vite.config.ts` importe le plugin Tailwind
- [ ] `src/style.css` contient `@import "tailwindcss"`
- [ ] Hard refresh dans le navigateur (Ctrl+Shift+R)

## 📝 Fichiers de configuration importants

### package.json (racine)
```json
{
  "dependencies": {
    "@tailwindcss/vite": "^4.1.14",
    "alpinejs": "^3.15.0",
    "tailwindcss": "^4.1.14"
  }
}
```

### backend/package.json
```json
{
  "type": "module",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "tsx": "^4.7.0",
    "typescript": "~5.9.3"
  }
}
```

## 🎉 Tout fonctionne!

Si tous les tests passent:
- ✅ Backend API fonctionnel
- ✅ Frontend connecté au backend
- ✅ CRUD complet (Create, Read, Update, Delete)
- ✅ Calculs automatiques corrects
- ✅ Filtres et tri fonctionnels
- ✅ Statistiques affichées

**Tu es prêt à utiliser Dofus Manager ! 🚀**

## 📚 Prochaines étapes

1. [ ] Lire le README.md pour comprendre les fonctionnalités
2. [ ] Lire ARCHITECTURE.md pour comprendre le code
3. [ ] Consulter ADVANCED_USAGE.md pour personnaliser
4. [ ] Ajouter tes propres items de craft Dofus!

## 💾 Sauvegarder ton travail

```bash
git init
git add .
git commit -m "Initial commit - Dofus Manager"
```

---

**Besoin d'aide?** Vérifie:
1. Les messages d'erreur dans le terminal
2. La console du navigateur (F12)
3. Les logs du backend
4. Que tous les fichiers sont bien créés
