import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (token) {
    const clonedRequest = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    return next(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized or 403 Forbidden responses
        if (error.status === 401 || error.status === 403) {
          console.warn('🔒 Auth Interceptor: Token expired or invalid, logging out user');
          
          // Clear authentication data
          authService.logout();
          
          // Redirect to login page if not already there
          if (!router.url.includes('/login')) {
            router.navigate(['/login']);
          }
        }
        
        return throwError(() => error);
      })
    );
  }

  return next(req);
};

