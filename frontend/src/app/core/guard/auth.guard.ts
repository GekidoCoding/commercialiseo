import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import {AuthUtilService} from '../../shared/services/auth-util.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  private authService = inject(AuthUtilService);
  private router = inject(Router);

  // Vérifie la route principale
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    return this.checkToken(state.url);
  }

  // Vérifie les routes enfants
  async canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    return this.checkToken(state.url);
  }

  // Vérifie token via verifyToken()
  private async checkToken(url: string): Promise<boolean | UrlTree> {
    const isValid = await this.authService.verifyToken();
    if (!isValid) {
      console.warn(`Accès refusé à ${url} : token manquant ou invalide`);
      // Redirection déjà gérée dans verifyToken via logout()
      return this.router.createUrlTree(['/auth']);
    }
    return true;
  }
}
