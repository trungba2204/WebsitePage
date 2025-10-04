import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AdminAuthService } from '../services/admin-auth.service';

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add admin token to admin API requests
  if (req.url.includes('/admin/')) {
    const adminAuthService = inject(AdminAuthService);
    const token = adminAuthService.getToken();

    if (token) {
      const clonedRequest = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next(clonedRequest);
    }
  }

  return next(req);
};
