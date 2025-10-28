import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AdminAuthService } from '../services/admin-auth.service';

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add admin token to admin API requests
  if (req.url.includes('/admin/')) {
    const adminAuthService = inject(AdminAuthService);
    const router = inject(Router);
    const token = adminAuthService.getToken();

    if (token) {
      const clonedRequest = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      
      return next(clonedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          // Handle 401 Unauthorized or 403 Forbidden responses
          if (error.status === 401 || error.status === 403) {
            console.warn('🔒 Admin Auth Interceptor: Token expired or invalid, logging out admin');
            
            // Clear authentication data
            adminAuthService.logout();
            
            // Redirect to admin login page if not already there
            if (!router.url.includes('/admin/login')) {
              router.navigate(['/admin/login']);
            }
          }
          
          return throwError(() => error);
        })
      );
    }
  }

  return next(req);
};
