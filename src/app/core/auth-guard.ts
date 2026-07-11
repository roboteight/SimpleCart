// src/app/core/auth-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

export const canActivateAuth: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn$.pipe(
    map(isIn => {
      if (!isIn) router.navigate(['/login']);
      return isIn;
    })
  );
};
