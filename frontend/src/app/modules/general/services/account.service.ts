import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../model/user';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private userSubject: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);
  private fromPrincipal: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  constructor(private router: Router, private http: HttpClient) {}

  public get user(): BehaviorSubject<User | null> {
    return this.userSubject;
  }
  public get firstLogin(): BehaviorSubject<boolean> {
    return this.fromPrincipal;
  }
  setFirstLogin(isFirstLogin: boolean) {
    this.fromPrincipal.next(isFirstLogin);
  }
  setUser(user: User) {
    this.userSubject.next(user);
  }
  getNewAccessToken(oldToken: string) {
    let httpHeader = new HttpHeaders();
    httpHeader = httpHeader
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${oldToken}`);

    return this.http.get(`${environment.PRINCIPAL}/api/auth/access-token`, {
      headers: httpHeader,
    });
  }
  getToken(): string | null {
    let session = sessionStorage.getItem('user');
    if (session != null) {
      return session;
    }
    return null;
  }
  getMatricule() {
    let session = sessionStorage.getItem('user');
    if (session != null) {
      return this.decodeUserInfo(session).matricule;
    }
    return null;
  }
  getUserInfoInToken() {
    let session = sessionStorage.getItem('user');
    if (session != null) {
      return this.decodeUserInfo(session);
    }
    return null;
  }
  getUserOracle() {
    let session = sessionStorage.getItem('user');
    if (session != null) {
      return this.decodeUserInfo(session).userOracle;
    }
    return null;
  }
  decodeUserInfo(token: string): any {
    if (token) return jwt_decode(token);

    return null;
  }

  getAgentActif(input: User) {
    return this.http.get(`${environment.PRINCIPAL}/api/getagentActifs`, {
      params: { agentMatricule: input.matricule },
    });
  }

  logout() {
    var data = {
      matricule: this.getMatricule(),
    };
    sessionStorage.clear();
    this.http.post(`${environment.PRINCIPAL}/api/auth/logout`, data).subscribe(
      (data) => {
        window.location.href = 'http://192.168.6.80';
      },
      (err) => {
        window.location.href = 'http://192.168.6.80';
      }
    );
  }
}
