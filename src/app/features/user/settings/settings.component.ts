import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { AuthService } from '../../../core/auth.service';
import { Subject, of, delay, map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private auth = inject(AuthService);
  user = this.auth.user;

  // Profile basics
  name = this.user()?.name ?? '';
  email = this.user()?.email ?? '';

  // Contact info (with safe fallbacks)
  phone = (this.user() as any)?.phone ?? '';
  address1 = (this.user() as any)?.address1 ?? '';
  address2 = (this.user() as any)?.address2 ?? '';
  city = (this.user() as any)?.city ?? '';
  state = (this.user() as any)?.state ?? '';
  postalCode = (this.user() as any)?.postalCode ?? '';
  country = (this.user() as any)?.country ?? '';

  // Address lookup + validation state
  addressValidated = false;
  validationMessage = '';
  suggestions: Array<{ address1: string; city: string; state: string; postalCode: string; country: string }> = [];
  addressLookupLoading = false;

  private addressQuery$ = new Subject<string>();

  constructor() {
    // Debounced address lookup stream
    this.addressQuery$
      .pipe(
        takeUntilDestroyed(),
        map(q => (q ?? '').trim()),
        debounceTime(250),
        distinctUntilChanged(),
        switchMap(q => {
          if (!q || q.length < 3) {
            return of({ loading: false, results: [] as typeof this.suggestions });
          }
          this.addressLookupLoading = true;
          return this.mockLookup(q).pipe(
            map(results => ({ loading: false, results }))
          );
        })
      )
      .subscribe(({ loading, results }) => {
        this.addressLookupLoading = loading;
        this.suggestions = results;
      });
  }

  //  address1 input changes
  onAddressInput(value: string) {
    this.markAddressUnvalidated();
    this.addressQuery$.next(value);
  }

  // Selecting a suggestion auto-validates
  applySuggestion(s: { address1: string; city: string; state: string; postalCode: string; country: string }) {
    this.address1 = s.address1;
    this.city = s.city;
    this.state = s.state;
    this.postalCode = s.postalCode;
    this.country = s.country;
    this.suggestions = [];
    // Consider a lookup suggestion as validated
    this.addressValidated = true;
    this.validationMessage = 'Address validated via lookup.';
  }

  // Manual validation for free-typed addresses
  validateAddress() {
    const postalOk = /^[A-Za-z0-9\s-]{3,12}$/.test(this.postalCode ?? '');
    const cityOk = (this.city ?? '').trim().length >= 2;
    const stateOk = (this.state ?? '').trim().length >= 2;
    const countryOk = (this.country ?? '').trim().length >= 2;
    const lineOk = (this.address1 ?? '').trim().length >= 3;

    if (postalOk && cityOk && stateOk && countryOk && lineOk) {
      this.addressValidated = true;
      this.validationMessage = 'Address looks valid.';
    } else {
      this.addressValidated = false;
      this.validationMessage = 'Please complete a valid address (check postal code, city, state, country, and line 1).';
    }
  }

  markAddressUnvalidated() {
    this.addressValidated = false;
    this.validationMessage = '';
  }

  save(f: NgForm) {
    if (f.invalid || !this.addressValidated) {
      Object.values(f.controls).forEach(c => c.markAsTouched());
      if (!this.addressValidated) this.validationMessage = 'Please validate your address before saving.';
      return;
    }
    this.auth.updateProfile({
      name: this.name,
      email: this.email,
      phone: this.phone,
      address1: this.address1,
      address2: this.address2,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      country: this.country,
    } as any);
    alert('Saved!');
  }

  // Mock async address lookup (replace with a real API if desired)
  private mockLookup(query: string) {
    const catalog: Array<{ address1: string; city: string; state: string; postalCode: string; country: string }> = [
      { address1: '1600 Amphitheatre Pkwy', city: 'Mountain View', state: 'CA', postalCode: '94043', country: 'USA' },
      { address1: '1 Apple Park Way', city: 'Cupertino', state: 'CA', postalCode: '95014', country: 'USA' },
      { address1: '350 5th Ave', city: 'New York', state: 'NY', postalCode: '10118', country: 'USA' },
      { address1: '10 Downing Street', city: 'London', state: 'London', postalCode: 'SW1A 2AA', country: 'UK' },
      { address1: 'Platz der Republik 1', city: 'Berlin', state: 'BE', postalCode: '11011', country: 'DE' },
    ];
    const q = query.toLowerCase();
    const results = catalog.filter(
      s =>
        s.address1.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.postalCode.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q)
    ).slice(0, 8);
    // Simulate network latency
    return of(results).pipe(delay(300));
  }
}
