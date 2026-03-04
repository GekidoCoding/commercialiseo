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

  // Vérifie token et userData sans appel API
  private async checkToken(url: string): Promise<boolean | UrlTree> {
    // Vérifier si un token existe dans localStorage ou sessionStorage
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) {
      console.warn(`Accès refusé à ${url} : token manquant`);
      return this.router.createUrlTree(['/auth']);
    }

    // Vérifier si les données utilisateur existent
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    
    if (!userData) {
      console.warn(`Accès refusé à ${url} : données utilisateur manquantes`);
      return this.router.createUrlTree(['/auth']);
    }

    // Optionnel : Vérifier si le token n'est pas expiré (si JWT avec payload)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        console.warn(`Accès refusé à ${url} : token expiré`);
        // Nettoyer le storage avant de rediriger
        this.authService.clearAllStorage();
        return this.router.createUrlTree(['/auth']);
      }
    } catch (error) {
      // Si le token n'est pas un JWT valide, on continue quand même
      // Certains tokens peuvent être dans un format différent
      console.log('Token non-JWT ou format différent, continuation...');
    }

    // Token et userData sont présents et valides
    console.log(`Accès autorisé à ${url}`);
    return true;
  }
}
