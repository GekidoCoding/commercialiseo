import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthUtilService} from '../../shared/services/auth-util.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // URLs des modules qui nécessitent l'authentification
  private protectedModules = ['/admin/', '/boutique/', '/acheteur/'];

  constructor(private authService: AuthUtilService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Vérifie si l'URL fait partie des modules protégés
    const isProtectedRoute = this.protectedModules.some(module =>
      req.url.includes(module)
    );

    // Si ce n'est pas une route protégée, laisse passer la requête sans modification
    if (!isProtectedRoute) {
      console.log('Route non protégée, pas d\'intercepteur:', req.url);
      return next.handle(req);
    }

    console.log("Route protégée - il entre:"+ req.url);

    const token = this.authService.getToken();

    console.log("token is here "+token);

    // Clone la requête et ajoute le header Authorization
    console.log('Adding Authorization header with token:', token);
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

    return next.handle(authReq);
  }
}
