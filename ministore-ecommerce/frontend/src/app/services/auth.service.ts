import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('🔍 AuthService login - Attempting user login:', { email: credentials.email });
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        console.log('✅ AuthService login - User login successful:', response);
        this.handleAuthResponse(response);
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private handleAuthResponse(response: AuthResponse): void {
    console.log('🔍 AuthService handleAuthResponse - Storing user data:', response.user);
    console.log('🔍 AuthService handleAuthResponse - User avatar:', response.user.avatar);
    
    // Preserve existing avatar if new response doesn't have one
    const existingUserStr = localStorage.getItem('user');
    let finalUser = response.user;
    
    if (existingUserStr && !response.user.avatar) {
      try {
        const existingUser = JSON.parse(existingUserStr);
        if (existingUser.avatar) {
          console.log('🔍 AuthService handleAuthResponse - Preserving existing avatar:', existingUser.avatar);
          finalUser = { ...response.user, avatar: existingUser.avatar };
        }
      } catch (error) {
        console.warn('⚠️ AuthService handleAuthResponse - Error parsing existing user:', error);
      }
    }
    
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem('user', JSON.stringify(finalUser));
    this.currentUser.set(finalUser);
    this.isAuthenticated.set(true);
    console.log('✅ AuthService handleAuthResponse - User authenticated successfully with avatar:', finalUser.avatar);
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        console.log('🔍 AuthService loadUserFromStorage - Loading user from storage:', user);
        console.log('🔍 AuthService loadUserFromStorage - User avatar:', user.avatar);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        console.log('✅ AuthService loadUserFromStorage - User loaded successfully');
      } catch (error) {
        console.error('❌ AuthService loadUserFromStorage - Error parsing user data:', error);
        this.logout();
      }
    } else {
      console.log('🔍 AuthService loadUserFromStorage - No user data found in storage');
    }
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  updateCurrentUser(updatedUser: User): void {
    console.log('🔍 AuthService updateCurrentUser - Updating user data:', updatedUser);
    console.log('🔍 AuthService updateCurrentUser - New avatar:', updatedUser.avatar);
    this.currentUser.set(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('✅ AuthService updateCurrentUser - User data updated successfully');
  }

  updateUserAvatar(avatarUrl: string): Observable<User> {
    console.log('🔍 AuthService updateUserAvatar - Updating avatar to:', avatarUrl);
    return this.http.put<User>(`${this.API_URL}/user/avatar`, { avatar: avatarUrl }).pipe(
      tap(updatedUser => {
        console.log('✅ AuthService updateUserAvatar - Avatar updated successfully:', updatedUser);
        this.updateCurrentUser(updatedUser);
      })
    );
  }
}

