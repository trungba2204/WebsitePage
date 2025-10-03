import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminUser } from '../models/admin.model';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  user: AdminUser;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private readonly API_URL = `${environment.apiUrl}/admin/auth`;
  private http = inject(HttpClient);
  private router = inject(Router);

  // Signals for reactive state management
  private adminUserSignal = signal<AdminUser | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);

  // Public readonly signals
  adminUser = this.adminUserSignal.asReadonly();
  isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        this.adminUserSignal.set(parsedUser);
        this.isAuthenticatedSignal.set(true);
      } catch (error) {
        this.clearAuth();
      }
    }
  }

  login(credentials: AdminLoginRequest): Observable<AdminLoginResponse> {
    return this.http.post<AdminLoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('admin_token', response.token);
          localStorage.setItem('admin_user', JSON.stringify(response.user));
          
          this.adminUserSignal.set(response.user);
          this.isAuthenticatedSignal.set(true);
        })
      );
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/admin/login']);
  }

  private clearAuth(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    this.adminUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  isAdmin(): boolean {
    const user = this.adminUserSignal();
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  }

  isSuperAdmin(): boolean {
    const user = this.adminUserSignal();
    return user?.role === 'SUPER_ADMIN';
  }

  refreshToken(): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.API_URL}/refresh`, {});
  }

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/change-password`, {
      oldPassword,
      newPassword
    });
  }

  updateProfile(profile: Partial<AdminUser>): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.API_URL}/profile`, profile)
      .pipe(
        tap(updatedUser => {
          localStorage.setItem('admin_user', JSON.stringify(updatedUser));
          this.adminUserSignal.set(updatedUser);
        })
      );
  }
}
