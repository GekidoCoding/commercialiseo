import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {UsersDto} from "../../../model/users/dto/users.dto";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UsersDtoService {
  private apiUrl = 'http://localhost:8080/api/test/users/dto';
  constructor(private http: HttpClient) { }

  private handleError(error:any){
    console.error('error API:' , error);
    return throwError(()=>new Error("Une erreur s ' est produite"));
  }

  getAll():Observable<UsersDto[]> {
    return this.http.get<UsersDto[]>(`${this.apiUrl}/`).pipe(
      catchError(this.handleError)
    );
  }
  getById(id:number):Observable<UsersDto> {
    return this.http.get<UsersDto>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    ) ;
  }
  create (user:UsersDto):Observable<UsersDto> {
    return this.http.post<UsersDto>(`${this.apiUrl}/create`, user).pipe(
      catchError(this.handleError)
    ) ;
  }
  update (id:number, user:UsersDto):Observable<UsersDto> {
    return this.http.put<UsersDto>(`${this.apiUrl}/update/${id}`, user).pipe(
      catchError(this.handleError)
    ) ;
  }
  delete (id:number):Observable<UsersDto> {
    return this.http.delete<UsersDto>(`${this.apiUrl}/delete/${id}`).pipe(
      catchError(this.handleError)
    ) ;
  }
}
