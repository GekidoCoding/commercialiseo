import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Category} from '../../../shared/model/category';
import {Observable, throwError} from 'rxjs';
import {ApiResponse} from '../../../shared/model/api-response';
import {ProductRead} from '../../../shared/model/product-read';
import {catchError} from 'rxjs/operators';
import {CartItem} from '../model/cart-item';

@Injectable({
  providedIn: 'root',
})
export class AcheteurService {
  private apiUrl = `${environment.apiUrl}/api/acheteur`; // URL backend

  constructor(private http: HttpClient) {}


  findAllProductsForClient(): Observable<ApiResponse<ProductRead[]>> {
    return this.http.get<ApiResponse<ProductRead[]>>(`${this.apiUrl}/products/for-clients`, {})
      .pipe(catchError(this.handleError));
  }
  /**
   * Récupère la liste des variants du panier depuis localStorage ou sessionStorage
   */
  getVariantsPanier(): CartItem[] {
    const storageKey = 'cart_variants';

    try {
      // Essayer d'abord localStorage, puis sessionStorage
      const cartJson = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);

      if (cartJson) {
        const cart = JSON.parse(cartJson);
        return Array.isArray(cart) ? cart : [];
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error);
    }

    return [];
  }


  /**
   * Gestion des erreurs
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
