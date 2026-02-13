import { Injectable, OnDestroy } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, Subscription, throwError } from 'rxjs';
import { AccountService } from '../services/account.service';
import { User } from '../model/user';

@Injectable({ providedIn: 'root' })
export class ApiInterceptor implements HttpInterceptor, OnDestroy {
  private userSubscription: Subscription | null = null;
  constructor(private account: AccountService) {
    this.userSubscription = this.account.user.subscribe((res) => {
      if (res != null) {
        this.user = res;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
  user: User | null = null;
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!request.url.includes('access-token')) {
      request = request.clone({
        headers: request.headers
          .set('Authorization', `Bearer ${this.account.getToken()}`)
          .set('utilisateur', this.user ? this.user.matricule : ''),
      });
      return next.handle(request).pipe<any>(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 401) {
            this.account.logout();
            return throwError(err);
          }
          return next.handle(request);
        })
      );
    } else {
      return next.handle(request);
    }
  }
}
