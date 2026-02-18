import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserConnected } from '../model/user.connected';
import { AuthService } from '../../features/auth/services/auth-service';
import { firstValueFrom, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthUtilService {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Récupère le token et vérifie sa validité
   */

  async getToken(): Promise<string> {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    console.log("token in getToken is :" +token);
    if (!token || token === '') {
      this.logout();
      return '';
    }

    try {
      const payload = await firstValueFrom(this.getPayload(token));

      if (!payload) {
        this.logout();
        return '';
      }

      // Vérifier l'expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        console.warn('Token expiré');
        this.logout();
        return '';
      }

    } catch (error) {
      console.error('Token invalide', error);
      this.router.navigate(['/auth']);
      return '';
    }

    return token;
  }

  /**
   * Récupère le payload depuis le backend
   */
  getPayload(token: string): Observable<UserConnected | null> {
    return this.authService.getPayload(token).pipe(
      map(response => response?.data || null),
      catchError(error => {
        console.error('Erreur lors du décodage du token', error);
        return of(null);
      })
    );
  }

  /**
   * Retourne l'utilisateur connecté
   */
  async getUser(): Promise<UserConnected | null> {
    const token = await this.getToken();
    if (!token) return null;

    try {
      const payload = await firstValueFrom(this.getPayload(token));
      console.log(payload);
      return payload;
    } catch (error) {
      console.error('Token invalide', error);
      this.router.navigate(['/auth']);
      return null;
    }
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken') || !!sessionStorage.getItem('authToken');
  }

  /**
   * Déconnexion
   */
  logout(): void {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    this.router.navigate(['/auth']);
  }

  /**
   * Redirige l'utilisateur après login selon son rôle
   */
  async navigateAfterLogin(): Promise<void> {
    const token = await this.getToken();
    if (!token) return;

    const payload = await firstValueFrom(this.getPayload(token));
    if (!payload) return;

    switch (payload.role) {
      case 'admin':
        await this.router.navigate(['/admin']);
        break;
      case 'boutique':
        await this.router.navigate(['/boutique']);
        break;
      default:
        await this.router.navigate(['/acheteur']);
        break;
    }
  }
}
