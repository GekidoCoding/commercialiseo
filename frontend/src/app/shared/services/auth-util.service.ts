import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {UserConnected} from '../model/user.connected';

@Injectable({ providedIn: 'root' })
export class AuthUtilService {

  constructor(private router: Router) {}

  getToken(): string {
    let token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (!token) {
      this.logout();
      return '';
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      // Vérifier l'expiration
      const now = Math.floor(Date.now() / 1000); // timestamp en secondes
      if (payload.exp && payload.exp < now) {
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


  getPayload(token: string) {
    const payload= JSON.parse(
      decodeURIComponent(
        atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );
    console.log ("Payload token :"+ payload);
    return payload;
  }


  getUser(): UserConnected | null {
    let token = this.getToken();

    try {
      const payload = this.getPayload(token);

      return {
        email: payload.email,
        username: payload.username,
        role: payload.role
      };
    } catch (error) {
      console.error('Token invalide', error);
      this.router.navigate(['/auth']);
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken') || !!sessionStorage.getItem('authToken');
  }

  logout() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    this.router.navigate(['/auth']);
  }

  navigateAfterLogin(){
    const token =this.getToken();
    if (token) {
      const payload =this.getPayload(token);
      if (payload.role === 'admin') {
        this.router.navigate(['/admin']);
      } else if (payload.role === 'boutique') {
        this.router.navigate(['/boutique']);
      }
      else  {
        this.router.navigate(['/acheteur']);
      }
    }
  }


}
