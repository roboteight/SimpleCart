import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from './core/auth.service';
import { CartService } from './core/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, AsyncPipe, NgIf],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div class="container">
        <a class="navbar-brand" routerLink="/products">Demo Store</a>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNavbar">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" routerLink="/products">Products</a>
            </li>
            <li class="nav-item" *ngIf="(isLoggedIn$ | async)">
              <a class="nav-link" routerLink="/favorites">Favorites</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/cart">
                Cart
                <span class="badge text-bg-primary ms-1">{{ cartCount() }}</span>
              </a>
            </li>
          </ul>

          <div class="d-flex align-items-center gap-2">
            <a
              *ngIf="!(isLoggedIn$ | async)"
              routerLink="/login"
              class="btn btn-outline-primary"
            >Login</a>

            <a
              *ngIf="(isLoggedIn$ | async)"
              routerLink="/settings"
              class="btn btn-outline-secondary"
            >Settings</a>

            <button
              *ngIf="(isLoggedIn$ | async)"
              (click)="logout()"
              class="btn btn-danger"
              type="button"
            >Logout</button>
          </div>
        </div>
      </div>
    </nav>

    <main class="container my-4">
      <router-outlet />
    </main>

    <footer class="border-top py-3 mt-auto">

    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      min-height: 100dvh;
      flex-direction: column;
    }
    footer { background-color: #fff; }
  `]
})
export class AppComponent {
  private auth = inject(AuthService);
  private cart = inject(CartService);

  isLoggedIn$ = this.auth.isLoggedIn$;
  cartCount = computed(() => this.cart.totalQuantity());

  logout() {
    this.auth.logout();
  }
}
