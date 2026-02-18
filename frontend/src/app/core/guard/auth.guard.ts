import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateChild,  ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import {AuthUtilService} from '../../shared/services/auth-util.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  private authService = inject(AuthUtilService);

  // Vérifie la route principale
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.checkToken(state.url);
  }

  // Vérifie les routes enfants
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.checkToken(state.url);
  }

  // Vérifie token via getToken()
  private checkToken(url: string): boolean | UrlTree {
    const token = this.authService.getToken(); // inclut expiration + logout
    if (!token) {
      console.warn(`Accès refusé à ${url} : token manquant ou expiré`);
      // Redirection déjà gérée dans getToken via logout()
      return false;
    }
    return true;
  }
}
