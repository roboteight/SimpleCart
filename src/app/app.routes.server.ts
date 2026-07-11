import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'products/:id',
    renderMode: RenderMode.Prerender,
    // Delegate prerender params discovery to the lazy chunk that exports `getPrerenderParams`
    getPrerenderParams: async () => {
      const mod = await import('./features/products/product-detail/product-detail.component');
      return mod.getPrerenderParams();
    }
  },
  // Fallback for all other routes
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
