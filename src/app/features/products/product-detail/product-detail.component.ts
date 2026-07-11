import {Component, inject} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {CurrencyPipe, NgIf, NgClass} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

import type {Product} from '../../../shared/models';
import {ProductService} from '../../../core/product.service';
import {CartService} from '../../../core/cart.service';
import {FavoritesService} from '../../../core/favorites.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, NgIf, NgClass],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private products = inject(ProductService);
  private cart = inject(CartService);
  private favs = inject(FavoritesService);

  product: Product | undefined;

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe(pm => {
        const id = pm.get('id');
        this.product = id ? this.products.findById(id) : undefined;
      });
  }

  addToCart(p: Product) { this.cart.add(p, 1); }
  toggleFav(p: Product) { this.favs.toggle(p.id); }
  isFav(p: Product) { return this.favs.isFavorite(p.id); }

  shareProduct(p: Product) {
    const url = this.buildProductUrl(p.id);
    const data = {
      title: p.title,
      text: p.description || p.title,
      url
    };

    if (navigator.share) {
      navigator.share(data).catch(err => {
        // If user cancels or share fails, fall back to copy
        this.copyToClipboard(url);
      });
    } else {
      this.copyToClipboard(url);
    }
  }

  private buildProductUrl(id: string) {
    // Build an absolute, shareable URL
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/products/${encodeURIComponent(id)}`;
  }

  private async copyToClipboard(text: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        alert('Link copied to clipboard!');
      } else {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('Link copied to clipboard!');
      }
    } catch {
      alert('Unable to share or copy the link.');
    }
  }
}

export async function getPrerenderParams(): Promise<Array<{ id: string }>> {
  // Note: This service has no DI dependencies in its constructor, so direct instantiation is safe here.
  const svc = new ProductService();
  return svc.all().map(p => ({ id: p.id }));
}
