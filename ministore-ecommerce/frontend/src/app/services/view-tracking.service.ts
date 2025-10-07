import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ViewTrackingService {
  private readonly API_URL = `${environment.apiUrl}/views`;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private trackedPages = new Set<string>();

  trackView(page: string): void {
    // Avoid duplicate tracking for the same page in the same session
    if (this.trackedPages.has(page)) {
      return;
    }

    this.trackedPages.add(page);

    const isAuthenticated = this.authService.isAuthenticated();
    
    if (isAuthenticated) {
      this.trackAuthenticatedView(page);
    } else {
      this.trackAnonymousView(page);
    }
  }

  private trackAnonymousView(page: string): void {
    this.http.post(`${this.API_URL}/track`, { page }).subscribe({
      next: () => {
        console.log('📊 Tracked anonymous view for page:', page);
      },
      error: (error) => {
        console.error('❌ Error tracking anonymous view:', error);
      }
    });
  }

  private trackAuthenticatedView(page: string): void {
    this.http.post(`${this.API_URL}/track-authenticated`, { page }).subscribe({
      next: () => {
        console.log('📊 Tracked authenticated view for page:', page);
      },
      error: (error) => {
        console.error('❌ Error tracking authenticated view:', error);
      }
    });
  }

  // Reset tracking for new session
  resetTracking(): void {
    this.trackedPages.clear();
  }
}
