import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {ApiResponse} from '../../../shared/model/api-response';
import {catchError} from 'rxjs/operators';
import {Variant} from '../../../shared/model/Variant';
import {ProductRead} from '../../../shared/model/product-read';

@Injectable({
  providedIn: 'root',
})
export class BoutiqueService {
  private apiUrl = `${environment.apiUrl}api/boutique`; // URL backend

  constructor(private http: HttpClient) {}

  createVariant(variant: Variant): Observable<ApiResponse<Variant>> {
    return this.http.post<ApiResponse<Variant>>(`${this.apiUrl}/create-variant`, variant)
      .pipe(catchError(this.handleError));
  }

  updateVariant(variant: Variant): Observable<ApiResponse<Variant>> {
    return this.http.put<ApiResponse<Variant>>(`${this.apiUrl}/update-variant`, variant)
      .pipe(catchError(this.handleError));
  }

  // Ajouter ces méthodes dans boutique.service.ts

  createVariantWithFiles(formData: FormData): Observable<ApiResponse<Variant>> {
    return this.http.post<ApiResponse<Variant>>(`${this.apiUrl}/create-variant-with-files`, formData)
      .pipe(catchError(this.handleError));
  }

  updateVariantWithFiles(formData: FormData): Observable<ApiResponse<Variant>> {
    return this.http.put<ApiResponse<Variant>>(`${this.apiUrl}/update-variant-with-files`, formData)
      .pipe(catchError(this.handleError));
  }

  findAllProductsForUser(userId:string): Observable<ApiResponse<ProductRead[]>> {
    return this.http.get<ApiResponse<ProductRead[]>>(`${this.apiUrl}/products/user/${userId}`)
      .pipe(catchError(this.handleError));
  }

  deleteVariant(variantId:string): Observable<ApiResponse<ProductRead[]>> {
    return this.http.delete<ApiResponse<ProductRead[]>>(`${this.apiUrl}/delete-variant/${variantId}`)
      .pipe(catchError(this.handleError));
  }


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
