// src/app/core/auth.service.ts
import { Injectable, NgZone, signal, computed } from '@angular/core';
// If you already import rxjs elsewhere in this file, keep only what's needed below
import {BehaviorSubject, fromEvent, merge, Subscription} from 'rxjs';
import type { User } from '../shared/models';

const LS_USER_KEY = 'demoapp.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<User | null>(this.loadUser());
  readonly user = computed(() => this.userSignal());
  readonly isLoggedIn$ = new BehaviorSubject<boolean>(!!this.userSignal());

  private readonly INACTIVITY_MS = 60 * 60 * 1000; // 60 minutes
  private inactivityTimerId: any = null;
  private activitySub?: Subscription;

  constructor(private zone: NgZone /* ... existing injections ... */) {
    // ... existing constructor code ...

    // Start/stop inactivity monitoring based on auth state
    // If you already have a login state observable/signal, hook into it here.
    // Example with observable `isLoggedIn$`:
    this.isLoggedIn$?.subscribe((loggedIn: boolean) => {
      if (loggedIn) this.initInactivityMonitor();
      else this.teardownInactivityMonitor();
    });

    // If your service persists sessions and user might already be logged in at startup,
    // you can optionally start the monitor here too:
    // if (this.isLoggedInSync()) this.initInactivityMonitor();
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(LS_USER_KEY);
      return raw ? JSON.parse(raw) as User : null;
    } catch {
      return null;
    }
  }

  private persist(user: User | null) {
    if (user) localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(LS_USER_KEY);
  }

  // Ensure logout clears the monitor
  logout() {
    this.teardownInactivityMonitor();
    this.userSignal.set(null);
    this.persist(null);
    this.isLoggedIn$.next(false);
  }

  // Call this at the end of a successful login
  async login(email: string, password: string): Promise<User> {
    // Mock login: accept any non-empty credentials
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !password) return reject(new Error('Invalid credentials'));
        const user: User = {
          id: crypto.randomUUID(),
          email,
          name: email.split('@')[0] || 'User',
        };
        this.userSignal.set(user);
        this.persist(user);
        this.isLoggedIn$.next(true);
        this.initInactivityMonitor();
        resolve(user);
      }, 400);
    });
  }

  updateProfile(patch: Partial<User>) {
    const current = this.userSignal();
    if (!current) return;
    const updated = { ...current, ...patch };
    this.userSignal.set(updated);
    this.persist(updated);
  }

  // Sets up the IntersectionObserver-based activity listeners and timer
  private initInactivityMonitor() {
    if (this.activitySub) return; // already active
    if (typeof window === 'undefined' || typeof document === 'undefined') return; // SSR guard

    this.zone.runOutsideAngular(() => {
      const sources = [
        fromEvent(document, 'pointerdown'),
        fromEvent(document, 'pointermove'),
        fromEvent(document, 'keydown'),
        fromEvent(document, 'scroll', { passive: true } as any),
        fromEvent(document, 'touchstart', { passive: true } as any),
        fromEvent(document, 'visibilitychange'),
      ];
      this.activitySub = merge(...sources).subscribe(() => this.resetInactivityTimer());
    });

    this.resetInactivityTimer();
  }

  private resetInactivityTimer() {
    if (this.inactivityTimerId) clearTimeout(this.inactivityTimerId);
    this.inactivityTimerId = setTimeout(() => {
      // Back to Angular zone to call logout and update UI
      this.zone.run(() => this.logout());
    }, this.INACTIVITY_MS);
  }

  private teardownInactivityMonitor() {
    if (this.inactivityTimerId) {
      clearTimeout(this.inactivityTimerId);
      this.inactivityTimerId = null;
    }
    if (this.activitySub) {
      this.activitySub.unsubscribe();
      this.activitySub = undefined;
    }
  }
}
