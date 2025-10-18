import { routes } from './routes';
import { RouteConfig } from './types';

export class Router {
  private currentRoute: RouteConfig | null = null;
  private routes: RouteConfig[];

  constructor() {
    this.routes = routes;
    this.init();
  }

  private init() {
    // Écouter les changements d'URL (boutons back/forward)
    window.addEventListener('popstate', () => this.handleRoute());
    
    // Intercepter les clics sur les liens avec data-link
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('[data-link]');
      
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) this.navigate(href);
      }
    });

    // Charger la route initiale
    this.handleRoute();
  }

  private handleRoute() {
    const path = window.location.pathname;
    const route = this.routes.find(r => r.path === path) || this.routes[0];
    
    this.currentRoute = route;
    document.title = `Kamas Manager - ${route.title}`;
    
    // Dispatcher un événement personnalisé pour Alpine
    window.dispatchEvent(new CustomEvent('route-changed', { 
      detail: { route } 
    }));
  }

  public navigate(path: string) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      this.handleRoute();
    }
  }

  public getCurrentRoute() {
    return this.currentRoute;
  }

  public getRoutes() {
    return this.routes;
  }
}

export const router = new Router();