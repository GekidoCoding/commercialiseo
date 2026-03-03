import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../model/api-response';
import {Product} from '../model/product';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {Category} from '../model/category';
import {ProductRead} from '../model/product-read';
@Injectable({
  providedIn: 'root',
})
export class PublicService {
  private apiUrl = `${environment.apiUrl}/api/public`; // URL backend

  constructor(private http: HttpClient) {}
  /**
   * Récupère tous les categories
   */
  findAllCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}/categories`, {})
      .pipe(catchError(this.handleError));
  }

  findAllProductsReal(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products`, {})
      .pipe(catchError(this.handleError));
  }


  /**
   * Creer un category
   */
  createCategory(category : Category): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${this.apiUrl}/category/create`, category)
      .pipe(catchError(this.handleError));
  }

  deleteCategory(id : string): Observable<ApiResponse<Category>> {
    return this.http.delete<ApiResponse<Category>>(`${this.apiUrl}/category/delete/${id}`)
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
