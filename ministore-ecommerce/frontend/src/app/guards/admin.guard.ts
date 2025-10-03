import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  authService = inject(AuthService);
  router = inject(Router);

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      const user = this.authService.currentUser();
      if (user && user.role === 'ADMIN') {
        return true;
      }
    }
    
    // Redirect to admin login if not authenticated or not admin
    this.router.navigate(['/admin/login']);
    return false;
  }
}