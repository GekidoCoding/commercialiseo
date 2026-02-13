import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Users} from "../../model/users/users";

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:8080/api/test/users';
  constructor(private http: HttpClient) { }

  getAll():Observable<Users> {
    return this.http.get<Users>(`${this.apiUrl}/`);
  }
  getById(id:number):Observable<Users> {
    return this.http.get<Users>(`${this.apiUrl}/${id}`);
  }
  create (user:Users):Observable<Users> {
    return this.http.post<Users>(`${this.apiUrl}/create`, user);
  }
  update (id:number, user:Users):Observable<Users> {
    return this.http.put<Users>(`${this.apiUrl}/update/${id}`, user);
  }
  delete (id:number):Observable<Users> {
    return this.http.delete<Users>(`${this.apiUrl}/delete/${id}`);
  }
}
