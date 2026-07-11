import {Component, computed, DestroyRef, inject, OnInit} from '@angular/core';
import {CurrencyPipe, NgClass, NgFor, NgIf} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FavoritesService} from '../../../core/favorites.service';
import {ProductService} from '../../../core/product.service';
import {CartService} from '../../../core/cart.service';
import {Product} from '../../../core/product';


@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [NgFor, NgIf, CurrencyPipe, RouterLink, NgClass],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss' // <-- ensure this file exists (or use .css)
})
export class FavoritesComponent implements OnInit {
  private readonly favs = inject(FavoritesService);
  private readonly products = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // View toggle persisted in ?view=grid|list
  viewMode: 'grid' | 'list' = 'grid';
  get isGrid(): boolean { return this.viewMode === 'grid'; }
  get isList(): boolean { return this.viewMode === 'list'; }



  // Favorites as a signal
  favProducts = computed<Product[]>(() => {
    const ids = new Set(this.favs.list());
    return this.products.all().filter(p => ids.has(p.id));
  });

  ngOnInit(): void {
    // Sync view mode from query params
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(qp => {
        const v = (qp.get('view') ?? '').toLowerCase();
        if (v === 'grid' || v === 'list') this.viewMode = v as 'grid' | 'list';
        else if (!v) this.viewMode = 'grid';
      });

    this.setViewMode(this.viewMode);
  }

  setViewMode(mode: 'grid' | 'list'): void {
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: mode },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  toggleFav(id: string) { this.favs.toggle(id); }
  addToCart(p: Product) { this.cart.add(p, 1); }
}
