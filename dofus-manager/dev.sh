#!/bin/bash

# Script de développement - Lance backend et frontend simultanément
# Utilisation: ./dev.sh

echo "🚀 Démarrage de Dofus Manager..."
echo ""

# Vérifier si les node_modules sont installés
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances frontend..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installation des dépendances backend..."
    cd backend && npm install && cd ..
fi

echo ""
echo "✨ Lancement des serveurs..."
echo "   Backend: http://localhost:3000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter les deux serveurs"
echo ""

# Lancer les deux serveurs en parallèle
trap 'kill 0' EXIT

# Backend
(cd backend && npm run dev) &

# Frontend
npm run dev &

# Attendre
wait