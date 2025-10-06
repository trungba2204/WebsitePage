import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent implements OnInit {
  adminAuthService = inject(AdminAuthService);
  notificationService = inject(NotificationService);
  router = inject(Router);

  email = '';
  password = '';
  isLoading = false;

  ngOnInit(): void {
    // Redirect to admin dashboard if already logged in
    if (this.adminAuthService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    this.isLoading = true;
    console.log('🔍 AdminLoginComponent onSubmit - Attempting admin login:', { email: this.email });

    this.adminAuthService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('✅ AdminLoginComponent onSubmit - Admin login successful:', response);
        
        // AdminAuthService already validates ADMIN role, so if we get here, user is admin
        this.notificationService.showSuccess('Thành công!', 'Đăng nhập admin thành công');
        this.router.navigate(['/admin/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ AdminLoginComponent onSubmit - Admin login error:', error);
        console.error('❌ Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        
        // Show appropriate error message
        if (error.status === 401) {
          this.notificationService.showError('Lỗi!', 'Email hoặc mật khẩu không đúng!\n\n💡 Tài khoản admin: admin@ministore.com / admin123');
        } else if (error.status === 403) {
          this.notificationService.showError('Lỗi!', 'Bạn không có quyền truy cập admin!\n\n💡 Chỉ tài khoản ADMIN mới có thể đăng nhập vào admin panel');
        } else {
          this.notificationService.showError('Lỗi!', 'Lỗi đăng nhập. Vui lòng thử lại!');
        }
      }
    });
  }

  goToUserLogin(): void {
    this.router.navigate(['/login']);
  }
}
