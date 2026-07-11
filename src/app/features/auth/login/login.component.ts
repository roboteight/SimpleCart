import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  template: `
    <div class="row justify-content-center">
      <div class="col-12 col-sm-10 col-md-8 col-lg-5">
        <div class="card shadow-sm">
          <div class="card-body">
            <h1 class="h4 mb-3">Login</h1>

            <form (ngSubmit)="onSubmit()" #f="ngForm" novalidate>
              <div class="mb-3">
                <label class="form-label" for="email">Email</label>
                <input
                  id="email"
                  name="email"
                  [(ngModel)]="email"
                  type="email"
                  class="form-control"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label" for="password">Password</label>
                <input
                  id="password"
                  name="password"
                  [(ngModel)]="password"
                  type="password"
                  class="form-control"
                  required
                />
              </div>

              <div class="d-grid gap-2">
                <button class="btn btn-primary" [disabled]="loading">
                  <span *ngIf="!loading">Login</span>
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  <span *ngIf="loading">Signing in…</span>
                </button>
                <a class="btn btn-outline-secondary" routerLink="/products">Back to products</a>
              </div>

              <div *ngIf="error" class="alert alert-danger mt-3" role="alert">
                {{ error }}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [``]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;
  error = '';

  async onSubmit() {
    this.loading = true; this.error = '';
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigateByUrl('/products');
    } catch (e: any) {
      this.error = e?.message ?? 'Login failed';
    } finally {
      this.loading = false;
    }
  }
}
