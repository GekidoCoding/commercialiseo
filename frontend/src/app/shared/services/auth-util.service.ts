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
    console.log( user);
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('userData', JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }));
  }

  /**
   * Récupère l'utilisateur connecté depuis le storage
   * Retourne null si vide (sans logout automatique)
   */
  getUserFromStorage(): User | null {
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (!userData) {
      // On ne fait pas logout ici, car le guard gérera la redirection
      return null;
    }

    try {
      const parsed = JSON.parse(userData);
      const user = new User();
      user.id = parsed.id || '';
      user.username = parsed.username || '';
      user.email = parsed.email || '';
      user.setRole(parsed.role || 'acheteur');
      return user;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur', error);
      // On ne fait pas logout ici non plus
      return null;
    }
  }
  getRole(){
    return this.getUserFromStorage()?.role || '';
  }
  /**
   * Vérifie si le token est valide via verifyToken
   * Ne fait PAS logout automatiquement - laisse le guard gérer
   */
  async verifyToken(): Promise<boolean> {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
      return false;
    }

    try {
      const response = await firstValueFrom(this.authService.verifyToken(token));
      if (response && response.valid) {
        return true;
      }
      console.warn('Token invalide');
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification du token', error);
      return false;
    }
  }



  /**
   * Déconnexion avec nettoyage complet du storage
   */
  logout(): void {
    // Nettoyer TOUS les items du localStorage et sessionStorage
    this.clearAllStorage();

    // Redirection vers la page d'authentification
    this.router.navigate(['/auth']).then(r => console.log(r));
  }

  /**
   * Nettoie complètement tout le storage
   */
  clearAllStorage(): void {
    // Supprimer les clés spécifiques
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
    localStorage.removeItem('cart_variants');
    sessionStorage.removeItem('cart_variants');

    // Nettoyer toutes les autres clés potentielles
    const keysToKeep: string | string[] = [];

    // Supprimer toutes les clés du localStorage
    Object.keys(localStorage).forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Supprimer toutes les clés du sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (!keysToKeep.includes(key)) {
        sessionStorage.removeItem(key);
      }
    });

    console.log('Storage complètement nettoyé');
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
