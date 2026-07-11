import { Routes } from '@angular/router';
import { canActivateAuth } from './core/auth-guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'settings',
    canActivate: [canActivateAuth],
    loadComponent: () => import('./features/user/settings/settings.component').then(m => m.SettingsComponent),
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    // Note: getPrerenderParams is exported from the lazy chunk (product-detail.component.ts)
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart/cart.component').then(m => m.CartComponent),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./features/favorites/favorites/favorites.component').then(m => m.FavoritesComponent),
  },
  { path: '**', redirectTo: 'products' },
];
