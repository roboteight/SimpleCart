// src/app/core/favorites.service.ts
import { Injectable, signal } from '@angular/core';

const LS_FAV_KEY = 'demoapp.favorites';

function loadFavs(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_FAV_KEY);
    const arr = raw ? JSON.parse(raw) as string[] : [];
    return new Set(arr);
  } catch {
    return new Set<string>();
  }
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private favsSig = signal<Set<string>>(loadFavs());

  isFavorite(id: string) { return this.favsSig().has(id); }
  list() { return Array.from(this.favsSig()); }

  toggle(id: string) {
    const s = new Set(this.favsSig());
    if (s.has(id)) s.delete(id); else s.add(id);
    this.favsSig.set(s);
    localStorage.setItem(LS_FAV_KEY, JSON.stringify(Array.from(s)));
  }
}
