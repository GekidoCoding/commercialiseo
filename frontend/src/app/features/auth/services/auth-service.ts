import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {environment} from '../../../../environments/environment';

interface AuthResponse {
  message: string;
}

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl+'api/auth'; // Remplacez par l'URL de votre backend si différent

  constructor(private http: HttpClient) {}

  /**
   * Demande d'inscription : envoie email et mot de passe au backend pour générer et envoyer le code de vérification
   * @param email Adresse email de l'utilisateur
   * @param username nom d'utilisateur
   * @param password Mot de passe de l'utilisateur
   * @param role role d'utilisateur
   * @returns Observable avec la réponse du serveur (message de confirmation)
   */
  registerRequest(email: string,username:string, password: string ,  role:string): Observable<AuthResponse> {
    const body = { email,username, password , role };

    return this.http.post<AuthResponse>(`${this.apiUrl}/register-request`, body).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Vérifie le code de vérification envoyé par email
   * @param email Adresse email de l'utilisateur
   * @param code Code de vérification
   * @returns Observable avec la réponse du serveur (message de succès)
   */
  verifyCode(email: string, code: string): Observable<AuthResponse> {
    const body = { email, code };

    return this.http.post<AuthResponse>(`${this.apiUrl}/verify-code`, body).pipe(
      catchError(this.handleError)
    );
  }



  resetPassword(email: string,password:string, code: string): Observable<AuthResponse> {
    const body = { email,password, code };

    return this.http.post<AuthResponse>(`${this.apiUrl}/change-password`, body).pipe(
      catchError(this.handleError)
    );
  }

  sendCodePassword(email: string , isPasswordUpdate:boolean): Observable<AuthResponse> {
    const body = { email , isPasswordUpdate:isPasswordUpdate };
    return this.http.post<AuthResponse>(`${this.apiUrl}/send-codePassword`, body).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Effectue la connexion de l'utilisateur
   * @param email Adresse email de l'utilisateur
   * @param password Mot de passe de l'utilisateur
   * @param remember Si true, stocke le token dans localStorage (persistant), sinon dans sessionStorage
   * @returns Observable avec la réponse du serveur (token)
   */
  login(email: string, password: string, remember: boolean = false): Observable<LoginResponse> {
    const body = { email, password };

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, body).pipe(
      tap((response) => {
        // Stockage du token
        if (remember) {
          localStorage.setItem('authToken', response.token);
        } else {
          sessionStorage.setItem('authToken', response.token);
        }

      }),
      catchError(this.handleError)
    );
  }

  getPayload(token: string): Observable<any> {
    const body = { token};
    return this.http.post<any>(`${this.apiUrl}/payload`, body).pipe(
      catchError(this.handleError)
    );
  }
  verifyToken(token: string): Observable<any> {
    const body = { token};
    return this.http.post<any>(`${this.apiUrl}/verify-token`, body).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gestion des erreurs HTTP
   * @param error Erreur HTTP
   * @returns Observable avec le message d'erreur
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inconnue est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = error.error?.message || `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }


}
