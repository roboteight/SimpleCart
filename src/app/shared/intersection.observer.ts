// TypeScript
import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[intersectionObserver]',
  standalone: true,
})
export class IntersectionObserverDirective implements AfterViewInit, OnChanges, OnDestroy {
  // Options
  @Input() ioRoot?: Element | null | string;
  @Input() ioRootMargin: string = '200px 0px';
  @Input() ioThreshold: number | number[] = 0.01;
  // If true, emits when first intersecting and then stops observing
  @Input() ioOnce: boolean = true;

  // Events
  @Output() ioVisible = new EventEmitter<boolean>(); // true when intersecting, false when leaving
  @Output() ioEnter = new EventEmitter<IntersectionObserverEntry>(); // entering viewport
  @Output() ioExit = new EventEmitter<IntersectionObserverEntry>(); // leaving viewport

  private observer?: IntersectionObserver;
  private initialized = false;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    this.initObserver();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Recreate the observer when options change (after first init)
    if (!this.initialized) return;
    if (changes['ioRoot'] || changes['ioRootMargin'] || changes['ioThreshold'] || changes['ioOnce']) {
      this.reobserve();
    }
  }

  ngOnDestroy() {
    this.disconnect();
  }

  private initObserver() {
    // SSR/Non-browser guard
    if (typeof window === 'undefined') {
      // Assume visible during SSR to avoid hydration mismatches
      this.ioVisible.emit(true);
      this.initialized = true;
      return;
    }

    if (!('IntersectionObserver' in window)) {
      // Fallback: treat as visible if API unsupported
      this.ioVisible.emit(true);
      this.initialized = true;
      return;
    }

    const options: IntersectionObserverInit = {
      root: this.resolveRoot(this.ioRoot),
      rootMargin: this.ioRootMargin,
      threshold: this.ioThreshold,
    };

    this.disconnect();
    this.observer = new IntersectionObserver((entries) => this.onEntries(entries), options);
    this.observer.observe(this.host.nativeElement);
    this.initialized = true;
  }

  private onEntries(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        this.ioVisible.emit(true);
        this.ioEnter.emit(entry);
        if (this.ioOnce) {
          // Stop observing after first successful intersection
          this.observer?.unobserve(this.host.nativeElement);
        }
      } else {
        // Only emit exit if still observing
        if (!this.ioOnce || this.observer) {
          this.ioVisible.emit(false);
          this.ioExit.emit(entry);
        }
      }
    }
  }

  private reobserve() {
    // Recreate observer with new options
    const wasOnce = this.ioOnce;
    this.disconnect();
    this.initObserver();
    // If we previously unobserved due to ioOnce and want to reobserve, ensure we’re observing again
    if (wasOnce && !this.ioOnce && this.observer) {
      this.observer.observe(this.host.nativeElement);
    }
  }

  private disconnect() {
    this.observer?.unobserve(this.host.nativeElement);
    this.observer?.disconnect();
    this.observer = undefined;
  }

  private resolveRoot(root: Element | string | null | undefined): Element | null | undefined {
    if (!root) return null; // viewport
    if (typeof root === 'string') {
      try {
        const el = document.querySelector<HTMLElement>(root);
        return el ?? null;
      } catch {
        return null;
      }
    }
    return root;
  }
}
