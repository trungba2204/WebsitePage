import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  adminAuthService = inject(AdminAuthService);
  router = inject(Router);

  canActivate(): boolean {
    console.log('AdminGuard: Checking authentication...');
    
    // Check localStorage directly first
    const token = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');
    
    console.log('AdminGuard: Token exists =', !!token);
    console.log('AdminGuard: User exists =', !!userStr);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('AdminGuard: User role =', user.role);
        
        if (user.role === 'ADMIN') {
          console.log('AdminGuard: Access granted via localStorage');
          // Update signals to match localStorage
          this.adminAuthService.adminUserSignal.set(user);
          this.adminAuthService.isAuthenticatedSignal.set(true);
          return true;
        }
      } catch (error) {
        console.error('AdminGuard: Error parsing user from localStorage', error);
      }
    }
    
    console.log('AdminGuard: Access denied, redirecting to login');
    // Redirect to admin login if not authenticated or not admin
    this.router.navigate(['/admin/login']);
    return false;
  }
}