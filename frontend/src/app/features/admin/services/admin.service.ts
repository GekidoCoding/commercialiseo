import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {Product} from '../../../shared/model/product';
import {ApiResponse} from '../../../shared/model/api-response';
import {ProductRead} from '../../../shared/model/product-read';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/api/admin`; // URL backend

  constructor(private http: HttpClient) {}

  /**
   * Crée un produit
   */
  createProduct(product: Product): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.apiUrl}/create-product`, product)
      .pipe(catchError(this.handleError));
  }

  /**
   * Met à jour un produit
   */
  updateProduct(product: Product): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/update-product`, product)
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère tous les produits
   */
  findAllProducts(): Observable<ApiResponse<ProductRead[]>> {
    return this.http.get<ApiResponse<ProductRead[]>>(`${this.apiUrl}/products`, {})
      .pipe(catchError(this.handleError));
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
