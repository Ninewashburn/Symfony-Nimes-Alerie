import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { environment } from '@env/environment';
import { JwtToken, LoginCredentials, User } from '@core/models/product.model';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthAt: string;
  address: string;
  city: string;
  telephone?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'jwt_token';
  private readonly currentUser = signal<User | null>(null);
  private readonly isAuthenticated = signal(false);

  readonly user = this.currentUser.asReadonly();
  readonly loggedIn = this.isAuthenticated.asReadonly();
  readonly isAdmin = computed(() => {
    const user = this.currentUser();
    return user?.roles?.includes('ROLE_ADMIN') ?? false;
  });

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.checkToken();
  }

  register(data: RegisterData): Observable<JwtToken> {
    return this.http
      .post(`${environment.apiUrl}/register`, data)
      .pipe(switchMap(() => this.login({ email: data.email, password: data.password })));
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/reset-password/request`, { email });
  }

  resetPassword(token: string, password: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/reset-password/confirm`, {
      token,
      password,
    });
  }

  login(credentials: LoginCredentials): Observable<JwtToken> {
    return this.http
      .post<JwtToken>(environment.loginUrl, credentials)
      .pipe(tap((response) => this.setToken(response.token)));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  updateProfile(
    data: Partial<User> & { currentPassword?: string; newPassword?: string },
  ): Observable<void> {
    return this.http
      .patch<void>(`${environment.apiUrl}/me`, data)
      .pipe(tap(() => this.fetchProfile()));
  }

  fetchProfile(): void {
    this.http.get<User>(`${environment.apiUrl}/me`).subscribe({
      next: (user) => this.currentUser.set(user),
      error: () => this.logout(),
    });
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.isAuthenticated.set(true);
    this.fetchProfile();
  }

  private checkToken(): void {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      this.isAuthenticated.set(true);
      this.fetchProfile();
    } else if (token) {
      localStorage.removeItem(this.tokenKey);
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
