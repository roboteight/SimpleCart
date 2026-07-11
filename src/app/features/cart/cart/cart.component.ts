import { Component, inject } from '@angular/core';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { CartService } from '../../../core/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NgFor, NgIf, CurrencyPipe],
  template: `
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="h3 m-0">Your Cart</h1>
      <div class="btn-group">
        <button class="btn btn-outline-secondary" (click)="clear()" [disabled]="!items().length">Clear Cart</button>
        <button class="btn btn-primary" (click)="checkout()" [disabled]="!items().length">Checkout</button>
      </div>
    </div>

    <div *ngIf="items().length; else empty">
      <div class="table-responsive">
        <table class="table align-middle">
          <thead class="table-light">
          <tr>
            <th scope="col">Product</th>
            <th scope="col" class="text-end">Price</th>
            <th scope="col" style="width: 140px;">Quantity</th>
            <th scope="col" class="text-end">Subtotal</th>
            <th scope="col" class="text-end"></th>
          </tr>
          </thead>
          <tbody>
          <tr *ngFor="let i of items()">
            <td>{{ i.product.title }}</td>
            <td class="text-end">{{ i.product.price | currency }}</td>
            <td>
              <input
                type="number"
                min="1"
                class="form-control form-control-sm"
                [value]="i.quantity"
                (change)="changeQty(i.product.id, $any($event.target).value)"
              />
            </td>
            <td class="text-end">{{ (i.product.price * i.quantity) | currency }}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-danger" (click)="remove(i.product.id)">Remove</button>
            </td>
          </tr>
          </tbody>
          <tfoot class="table-light">
          <tr>
            <td colspan="3" class="text-end fw-semibold">Total:</td>
            <td class="text-end fw-bold">{{ total() | currency }}</td>
            <td></td>
          </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <ng-template #empty>
      <div class="alert alert-info" role="alert">
        Your cart is empty.
      </div>
    </ng-template>
  `,
  styles: [``]
})
export class CartComponent {
  private cart = inject(CartService);

  items = this.cart.items;
  total = this.cart.totalPrice;

  changeQty(id: string, value: string) {
    const v = parseInt(value, 10);
    if (!Number.isNaN(v) && v > 0) this.cart.setQuantity(id, v);
  }
  remove(id: string) { this.cart.remove(id); }
  clear() { this.cart.clear(); }
  checkout() {
    alert('This is a demo. Implement checkout with your backend/payment provider.');
  }
}
