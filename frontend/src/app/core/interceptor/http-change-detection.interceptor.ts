import { Injectable, ApplicationRef } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Intercepteur qui force la détection de changement après CHAQUE requête HTTP
 * Résout les problèmes de chargement infini et d'affichage qui ne se met pas à jour
 */
@Injectable()
export class HttpChangeDetectionInterceptor implements HttpInterceptor {
  constructor(private appRef: ApplicationRef) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(() => {
        // Force la détection de changement après chaque réponse HTTP
        setTimeout(() => {
          this.appRef.tick();
        }, 0);
      })
    );
  }
}
