import { RouteConfig } from './types';

export const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'home',
    component: 'home',
    title: 'Accueil'
  },
  {
    path: '/items',
    name: 'items',
    component: 'items',
    title: 'Gestion des Items'
  },
  {
    path: '/stats',
    name: 'stats',
    component: 'stats',
    title: 'Statistiques'
  },
  {
    path: '/settings',
    name: 'settings',
    component: 'settings',
    title: 'Paramètres'
  }
];