// cart-event.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartEventService {
  private cartUpdated$ = new Subject<void>();
  cartUpdated = this.cartUpdated$.asObservable();

  notifyCartUpdated(): void {
    this.cartUpdated$.next();
  }
}
