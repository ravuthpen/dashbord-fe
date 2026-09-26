import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {

  private httpRequests = 0;
  private navInFlight = false;

  readonly isLoading = signal<boolean>(false);

  private recompute(): void {
    this.isLoading.set(this.httpRequests > 0 || this.navInFlight);
  }

  startHttp(): void {
    this.httpRequests++;
    this.recompute();
  }

  stopHttp(): void {
    this.httpRequests = Math.max(0, this.httpRequests - 1);
    this.recompute();
  }

  startNav(): void {
    this.navInFlight = true;
    this.recompute();
  }

  stopNav(): void {
    this.navInFlight = false;
    this.recompute();
  }
}
