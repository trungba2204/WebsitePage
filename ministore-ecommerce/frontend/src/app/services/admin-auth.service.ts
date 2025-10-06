import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminUser } from '../models/admin.model';
import { User } from '../models/user.model';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);
  private router = inject(Router);

  // Signals for reactive state management
  adminUserSignal = signal<User | null>(null);
  isAuthenticatedSignal = signal<boolean>(false);

  // Public readonly signals
  adminUser = this.adminUserSignal.asReadonly();
  isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    
    console.log('🔍 AdminAuthService initializeAuth - Token exists:', !!token);
    console.log('🔍 AdminAuthService initializeAuth - User data exists:', !!user);
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user) as User;
        console.log('🔍 AdminAuthService initializeAuth - Parsed user:', parsedUser);
        console.log('🔍 AdminAuthService initializeAuth - User role:', parsedUser.role);
        
        // Only set as authenticated if user has ADMIN role
        if (parsedUser.role === 'ADMIN') {
          this.adminUserSignal.set(parsedUser);
          this.isAuthenticatedSignal.set(true);
          console.log('✅ AdminAuthService initializeAuth - Admin authenticated successfully');
        } else {
          console.log('❌ AdminAuthService initializeAuth - User role is not ADMIN:', parsedUser.role);
          this.clearAuth();
        }
      } catch (error) {
        console.log('❌ AdminAuthService initializeAuth - Error parsing user data:', error);
        this.clearAuth();
      }
    } else {
      console.log('🔍 AdminAuthService initializeAuth - No token or user data found');
    }
  }

  login(credentials: AdminLoginRequest): Observable<AdminLoginResponse> {
    console.log('AdminAuthService: Attempting login with', credentials);
    return this.http.post<AdminLoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('AdminAuthService: Login response received', response);
          // Only allow ADMIN users to login through admin panel
          if (response.user.role !== 'ADMIN') {
            console.error('AdminAuthService: Access denied - not admin role');
            throw new Error('Access denied. Admin role required.');
          }
          
          console.log('AdminAuthService: Storing token and user data');
          localStorage.setItem('admin_token', response.token);
          localStorage.setItem('admin_user', JSON.stringify(response.user));
          
          this.adminUserSignal.set(response.user);
          this.isAuthenticatedSignal.set(true);
          console.log('AdminAuthService: Login successful');
        })
      );
  }

  logout(): void {
    console.log('🔍 AdminAuthService logout - Starting logout process');
    this.clearAuth();
    console.log('🔍 AdminAuthService logout - Auth cleared, navigating to login');
    this.router.navigate(['/admin/login']);
    console.log('🔍 AdminAuthService logout - Navigation triggered');
  }

  private clearAuth(): void {
    console.log('🔍 AdminAuthService clearAuth - Removing admin token and user data');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    this.adminUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    console.log('🔍 AdminAuthService clearAuth - Auth signals cleared');
  }

  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  isAdmin(): boolean {
    const user = this.adminUserSignal();
    return user?.role === 'ADMIN';
  }

  isSuperAdmin(): boolean {
    // SUPER_ADMIN role doesn't exist in current system
    return false;
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

  updateProfile(profile: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/profile`, profile)
      .pipe(
        tap(updatedUser => {
          localStorage.setItem('admin_user', JSON.stringify(updatedUser));
          this.adminUserSignal.set(updatedUser);
        })
      );
  }

  updateAdminAvatar(updatedUser: User): void {
    console.log('🔍 AdminAuthService updateAdminAvatar - Received updated user:', updatedUser);
    
    // Get current admin user data to preserve existing fields
    const currentAdminUser = this.adminUserSignal();
    console.log('🔍 AdminAuthService updateAdminAvatar - Current admin user:', currentAdminUser);
    
    if (currentAdminUser) {
      // Merge updated avatar with existing user data to preserve name and other fields
      const mergedUser = { ...currentAdminUser, avatar: updatedUser.avatar };
      console.log('🔍 AdminAuthService updateAdminAvatar - Merged user data:', mergedUser);
      
      localStorage.setItem('admin_user', JSON.stringify(mergedUser));
      this.adminUserSignal.set(mergedUser);
      console.log('✅ AdminAuthService updateAdminAvatar - Avatar updated while preserving other fields');
    } else {
      // Fallback: use the updated user data as-is
      console.log('⚠️ AdminAuthService updateAdminAvatar - No current user found, using updated user as-is');
      localStorage.setItem('admin_user', JSON.stringify(updatedUser));
      this.adminUserSignal.set(updatedUser);
    }
  }

  uploadAvatar(file: File): Observable<User> {
    console.log('🔍 AdminAuthService uploadAvatar - Uploading file:', file.name);
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const headers: { [key: string]: string } = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.http.post<User>(`${this.API_URL}/upload-avatar`, formData, { headers }).pipe(
      tap((updatedUser: User) => {
        console.log('✅ AdminAuthService uploadAvatar - Avatar uploaded successfully:', updatedUser);
        this.updateAdminAvatar(updatedUser);
      })
    );
  }
}
