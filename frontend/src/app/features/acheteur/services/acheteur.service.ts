import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Category} from '../../../shared/model/category';
import {Observable, throwError} from 'rxjs';
import {ApiResponse} from '../../../shared/model/api-response';
import {ProductRead} from '../../../shared/model/product-read';
import {catchError} from 'rxjs/operators';
import {CartItem} from '../model/cart-item';
import {PurchaseRequest, PurchaseResponse} from '../model/purchase-request';

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
   * Confirme l'achat des articles du panier
   * @param acheteurId - ID de l'acheteur connecté
   * @param password - Mot de passe pour validation
   * @param variants - Tableau des variantes avec leur quantité
   * @returns Observable avec la réponse de l'API
   */
  confirmPurchase(
    acheteurId: string,
    password: string,
    variants: { variantId: string; quantity: number }[]
  ): Observable<ApiResponse<PurchaseResponse>> {
    const request: PurchaseRequest = {
      acheteurId,
      password,
      variants
    };

    return this.http.post<ApiResponse<PurchaseResponse>>(`${this.apiUrl}/purchase`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gestion des erreurs
   * Interprète les erreurs du backend (ApiError) et les formate correctement
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inconnue est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur - Format ApiError du backend
      if (error.error?.message) {
        // Le backend renvoie un objet avec message et statusCode
        errorMessage = error.error.message;
      } else if (error.error?.error) {
        errorMessage = error.error.error;
      } else {
        errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
      }
    }

    console.error('Erreur API:', error);
    return throwError(() => new Error(errorMessage));
  }
}
