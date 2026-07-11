// src/app/core/cart.service.ts
import { Injectable, signal, computed } from '@angular/core';
import type { CartItem, Product } from '../shared/models';

const LS_CART_KEY = 'demoapp.cart';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(LS_CART_KEY);
    return raw ? JSON.parse(raw) as CartItem[] : [];
  } catch {
    return [];
  }
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSig = signal<CartItem[]>(loadCart());
  readonly items = computed(() => this.itemsSig());
  readonly totalQuantity = computed(
    () => this.itemsSig().reduce((sum, i) => sum + i.quantity, 0)
  );
  readonly totalPrice = computed(
    () => this.itemsSig().reduce((sum, i) => sum + i.quantity * i.product.price, 0)
  );

  private persist() {
    localStorage.setItem(LS_CART_KEY, JSON.stringify(this.itemsSig()));
  }

  add(product: Product, qty = 1) {
    const items = [...this.itemsSig()];
    const idx = items.findIndex(i => i.product.id === product.id);
    if (idx >= 0) items[idx] = { ...items[idx], quantity: items[idx].quantity + qty };
    else items.push({ product, quantity: qty });
    this.itemsSig.set(items);
    this.persist();
  }

  setQuantity(productId: string, qty: number) {
    const items = this.itemsSig().map(i => i.product.id === productId ? { ...i, quantity: Math.max(1, qty) } : i);
    this.itemsSig.set(items);
    this.persist();
  }

  remove(productId: string) {
    this.itemsSig.set(this.itemsSig().filter(i => i.product.id !== productId));
    this.persist();
  }

  clear() {
    this.itemsSig.set([]);
    this.persist();
  }
}
