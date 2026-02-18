import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth-service';
import { firstValueFrom } from 'rxjs';
import {User} from '../../features/auth/models/User';

@Injectable({ providedIn: 'root' })
export class AuthUtilService {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Récupère le token depuis le storage
   */
  getToken(): string | null {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  /**
   * Récupère le token de manière asynchrone avec vérification
   */
  async getTokenAsync(): Promise<string> {
    const isValid = await this.verifyToken();
    if (!isValid) {
      return '';
    }
    return this.getToken() || '';
  }

  /**
   * Stocke l'utilisateur connecté dans le storage (localStorage ou sessionStorage)
   */
  storeUser(user: User, remember: boolean = false): void {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('userData', JSON.stringify({
      username: user.username,
      email: user.email,
      role: user.role
    }));
  }

  /**
   * Récupère l'utilisateur connecté depuis le storage
   * Si vide, effectue logout et retourne null
   */
  getUserFromStorage(): User | null {
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (!userData) {
      this.logout();
      return null;
    }

    try {
      const parsed = JSON.parse(userData);
      const user = new User();
      user.username = parsed.username || '';
      user.email = parsed.email || '';
      user.setRole(parsed.role || 'acheteur');
      return user;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur', error);
      this.logout();
      return null;
    }
  }

  /**
   * Vérifie si le token est valide via verifyToken
   */
  async verifyToken(): Promise<boolean> {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
      this.logout();
      return false;
    }

    try {
      const response = await firstValueFrom(this.authService.verifyToken(token));
      if (response && response.valid) {
        return true;
      }
      console.warn('Token invalide');
      this.logout();
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification du token', error);
      this.logout();
      return false;
    }
  }



  /**
   * Déconnexion
   */
  logout(): void {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
    this.router.navigate(['/auth']).then(r => console.log(r));
  }

  /**
   * Redirige l'utilisateur après login selon son rôle
   */
  async navigateAfterLogin(): Promise<void> {
    const user = this.getUserFromStorage();
    if (!user) return;

    switch (user.role) {
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
