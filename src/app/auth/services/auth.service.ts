import { Injectable } from '@angular/core';
import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';
import { environment } from '../../../environment/environment';

export interface LoginRequest {
  countryCode: string;
  phoneNumber: string;
  userType: string;
  pin: string;
}

export interface LoginResponse {
  accessToken?: string;
  access_token?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly base = `${environment.apiUrl}/api/v1/auth`;

  constructor(
    private readonly http: HttpClient
  ) {}

  login(
    request: LoginRequest
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.base}/login`,
      request
    );
  }

  saveToken(token: string): void {

    localStorage.setItem(
      'accessToken',
      token
    );
  }

  getToken(): string | null {

    return localStorage.getItem(
      'accessToken'
    );
  }

  logout(): void {

    localStorage.removeItem(
      'accessToken'
    );
  }

  isLoggedIn(): boolean {

    return !!this.getToken();
  }
}
