import { Component, DestroyRef, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatestWith, debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

import { ProductService } from '../../../core/product.service';
import { Product } from '../../../core/product';
import { CartService } from '../../../core/cart.service';
import { FavoritesService } from '../../../core/favorites.service';
import { IntersectionObserverDirective } from '../../../shared/intersection.observer';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, IntersectionObserverDirective],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  // Dependencies
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  protected readonly cart = inject(CartService);
  protected readonly favs = inject(FavoritesService);
  private readonly destroyed$ = inject(DestroyRef);

  // View mode synced with query param ?view=grid|list
  viewMode: 'grid' | 'list' = 'grid';
  get isGrid(): boolean { return this.viewMode === 'grid'; }
  get isList(): boolean { return this.viewMode === 'list'; }

  // Imperative pagination state (kept in sync with query params; used by UI bindings)
  page = 1;
  pageSize = 10;
  total = this.productService.count();
  totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
  pages: number[] = Array.from({ length: this.totalPages }, (_, i) => i + 1);

  // Data source
  readonly products$ = this.productService.getProducts();

  // Derived categories from products
  readonly categories$ = this.products$.pipe(
    map((items) => {
      const set = new Set<string>();
      for (const p of items) set.add((p as any).category ?? 'uncategorized');
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    })
  );

  // Filters/sort form
  readonly form = this.fb.nonNullable.group({
    q: this.fb.nonNullable.control<string>(''),
    category: this.fb.nonNullable.control<string>(''),
    min: this.fb.nonNullable.control<number | null>(null),
    max: this.fb.nonNullable.control<number | null>(null),
    sort: this.fb.nonNullable.control<'relevance' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'>('relevance'),
  });

  // Normalize and compare helpers for filters
  private static normalizeFilters(v: Partial<{ q: string; category: string; min: number | null; max: number | null; sort: string }>) {
    return {
      q: (v.q ?? '').trim(),
      category: (v.category ?? '').trim(),
      min: v.min ?? null,
      max: v.max ?? null,
      sort: (v.sort ?? 'relevance') as 'relevance' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc',
    };
  }
  private static sameFilters(a: ReturnType<typeof ProductListComponent.normalizeFilters>, b: ReturnType<typeof ProductListComponent.normalizeFilters>) {
    return a.q === b.q &&
      a.category === b.category &&
      (a.min ?? null) === (b.min ?? null) &&
      (a.max ?? null) === (b.max ?? null) &&
      a.sort === b.sort;
  }

  // Filtered + sorted products (reactive)
  readonly filteredProducts$ = this.products$.pipe(
    combineLatestWith(
      this.form.valueChanges.pipe(
        startWith(this.form.getRawValue()),
        debounceTime(200),
        map(v => ProductListComponent.normalizeFilters(v)),
        distinctUntilChanged(ProductListComponent.sameFilters)
      )
    ),
    map(([products, filters]) => {
      const q = filters.q.toLowerCase();
      const category = filters.category.toLowerCase();
      const min = filters.min;
      const max = filters.max;
      const sort = filters.sort;

      let out = products.filter((p: Product & { category?: string }) => {
        const name = p.title ?? (p as any).name ?? '';
        const nameHit = !q || name.toLowerCase().includes(q);
        const catHit = !category || (p.category ?? 'uncategorized').toLowerCase() === category;
        const price = Number(p.price ?? 0);
        const minHit = min === null || price >= min;
        const maxHit = max === null || price <= max;
        return nameHit && catHit && minHit && maxHit;
      });

      switch (sort) {
        case 'price_asc':
          out = [...out].sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
          break;
        case 'price_desc':
          out = [...out].sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
          break;
        case 'name_asc':
          out = [...out].sort((a, b) => (a.title ?? (a as any).name ?? '').localeCompare(b.title ?? (b as any).name ?? ''));
          break;
        case 'name_desc':
          out = [...out].sort((a, b) => (b.title ?? (b as any).name ?? '').localeCompare(a.title ?? (a as any).name ?? ''));
          break;
        default:
          break;
      }
      return out;
    })
  );

  // Query param-derived pagination (reactive)
  readonly pageParams$ = this.route.queryParamMap.pipe(
    map((qp) => {
      const rawPage = Number(qp.get('page'));
      const rawSize = Number(qp.get('pageSize'));
      const page = Number.isFinite(rawPage) && qp.get('page') !== null ? Math.max(1, Math.floor(rawPage)) : 1;
      const pageSize = Number.isFinite(rawSize) && qp.get('pageSize') !== null ? Math.max(1, Math.floor(rawSize)) : 10;
      return { page, pageSize };
    })
  );

  // Totals and pages (reactive)
  readonly filteredCount$ = this.filteredProducts$.pipe(map(items => items.length));
  readonly totalPages$ = this.filteredCount$.pipe(
    combineLatestWith(this.pageParams$),
    map(([total, { pageSize }]) => Math.max(1, Math.ceil(total / pageSize)))
  );
  readonly pages$ = this.totalPages$.pipe(
    map((tp) => Array.from({ length: tp }, (_, i) => i + 1))
  );

  // Slice filtered items according to page/pageSize
  readonly pagedProducts$ = this.filteredProducts$.pipe(
    combineLatestWith(this.pageParams$),
    map(([items, { page, pageSize }]) => {
      const start = (page - 1) * pageSize;
      return items.slice(start, start + pageSize);
    })
  );

  // Intersection observer visibility
  private visibleIds = new Set<string>();
  isVisible(id: string): boolean { return this.visibleIds.has(id); }
  onVisible(id: string, v: boolean): void { if (v) this.visibleIds.add(id); }

  constructor() {
    // Keep local pagination fields in sync with query params and normalize them
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyed$))
      .subscribe((qp) => {
        const qpPageRaw = Number(qp.get('page'));
        const qpSizeRaw = Number(qp.get('pageSize'));

        const hasPage = Number.isFinite(qpPageRaw) && qp.get('page') !== null;
        const hasSize = Number.isFinite(qpSizeRaw) && qp.get('pageSize') !== null;

        const nextPageSize = hasSize ? clampInt(qpSizeRaw, 1, 500) : 10;
        const nextTotalPages = Math.max(1, Math.ceil(this.total / nextPageSize));
        const nextPage = hasPage ? clampInt(qpPageRaw, 1, nextTotalPages) : 1;

        const needNormalize = (!hasPage || !hasSize) || (qpPageRaw !== nextPage) || (qpSizeRaw !== nextPageSize);
        if (needNormalize) {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page: nextPage, pageSize: nextPageSize },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
          return;
        }

        const pagingChanged = (this.page !== nextPage) || (this.pageSize !== nextPageSize);
        if (pagingChanged) {
          this.pageSize = nextPageSize;
          this.totalPages = nextTotalPages;
          this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
          this.page = nextPage;
          this.visibleIds.clear();
        }
      });

    function clampInt(n: number, min: number, max: number) {
      const v = Math.floor(Number(n) || 0);
      return Math.min(max, Math.max(min, v));
    }
  }

  ngOnInit(): void {
    // Sync view mode with query params (preserved during filtering)
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyed$))
      .subscribe((qp) => {
        const v = (qp.get('view') ?? '').toLowerCase();
        if (v === 'grid' || v === 'list') this.viewMode = v as 'grid' | 'list';
        else if (!v) this.viewMode = 'grid';
      });

    // Initialize filters from query params
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyed$))
      .subscribe((qp) => {
        const patch = ProductListComponent.normalizeFilters({
          q: qp.get('q') ?? '',
          category: qp.get('category') ?? '',
          min: qp.has('min') ? Number(qp.get('min')) : null,
          max: qp.has('max') ? Number(qp.get('max')) : null,
          sort: qp.get('sort') ?? 'relevance',
        });
        const current = ProductListComponent.normalizeFilters(this.form.getRawValue());
        if (!ProductListComponent.sameFilters(current, patch)) {
          this.form.patchValue(patch, { emitEvent: false });
        }
      });

    // Reflect form changes into query params (preserve view via merge)
    this.form.valueChanges
      .pipe(debounceTime(200), takeUntilDestroyed(this.destroyed$))
      .subscribe((val) => {
        const v = ProductListComponent.normalizeFilters(val);
        const queryParams: Record<string, any> = {
          q: v.q || null,
          category: v.category || null,
          min: v.min ?? null,
          max: v.max ?? null,
          sort: v.sort !== 'relevance' ? v.sort : null,
          page: 1, // reset page on filter change
        };
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams,
          queryParamsHandling: 'merge', // preserve view and pageSize
          replaceUrl: true,
        });
      });

    // Default max price if not set
    this.products$
      .pipe(takeUntilDestroyed(this.destroyed$))
      .subscribe((items) => {
        const maxPrice = items.reduce((m, p) => Math.max(m, Number(p.price ?? 0)), 0);
        const current = this.form.getRawValue();
        if (current.max === null && maxPrice > 0) {
          this.form.patchValue({ max: maxPrice }, { emitEvent: false });
        }
      });
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

  clearFilters(): void {
    this.form.setValue({
      q: '',
      category: '',
      min: null,
      max: null,
      sort: 'relevance',
    });
  }

  // Pagination helpers
  protected navigateTo(page: number, pageSize = this.pageSize) {
    const size = Math.max(1, Math.floor(pageSize));
    const totalPages = Math.max(1, Math.ceil(this.total / size));
    const target = Math.max(1, Math.min(totalPages, Math.floor(page)));
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: target, pageSize: size },
      queryParamsHandling: 'merge',
    });
  }

  changePageSize(size: number) {
    const normalized = Math.max(1, Math.floor(Number(size) || 10));
    // Keep the first item of current page visible after change
    const firstIndex = (this.page - 1) * this.pageSize;
    const nextPage = Math.floor(firstIndex / normalized) + 1;
    this.navigateTo(nextPage, normalized);
  }

  // Keyboard navigation (Left = prev page, Right = next page)
  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
      this.navigateTo(this.page - 1);
    } else if (e.key === 'ArrowRight') {
      this.navigateTo(this.page + 1);
    }
  }

  // Cart/Favorites helpers
  inCart(p: Product): boolean {
    return this.cart.items().some(i => i.product.id === p.id);
  }
  qtyInCart(p: Product): number {
    const found = this.cart.items().find(i => i.product.id === p.id);
    return found?.quantity ?? 0;
  }
  addToCart(p: Product) { this.cart.add(p, 1); }
  toggleFav(p: Product) { this.favs.toggle(p.id); }
  isFav(p: Product) { return this.favs.isFavorite(p.id); }

  // Share helpers
  shareProduct(p: Product): void {
    const url: string = this.buildProductUrl(p.id);
    const data: ShareData = {
      title: (p as any).title ?? 'Product',
      text: (p as any).description || (p as any).title,
      url
    };
    if (navigator.share) {
      navigator.share(data).catch(() => { this.copyToClipboard(url); });
    } else {
      this.copyToClipboard(url);
    }
  }
  private buildProductUrl(id: string) {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/products/${encodeURIComponent(id)}`;
  }
  private async copyToClipboard(text: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        alert('Link copied to clipboard!');
      } else {
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
