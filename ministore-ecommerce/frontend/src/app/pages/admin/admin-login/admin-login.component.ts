import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService, AdminLoginRequest } from '../../../services/admin-auth.service';
import { NotificationService } from '../../../services/notification.service';

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

  loginForm: AdminLoginRequest = {
    email: '',
    password: ''
  };

  isLoading = false;
  showPassword = false;

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.adminAuthService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    this.adminAuthService.login(this.loginForm).subscribe({
      next: () => {
        this.isLoading = false;
        this.notificationService.showSuccess(
          'Đăng nhập thành công!',
          'Chào mừng bạn đến với Admin Panel'
        );
        this.router.navigate(['/admin/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.notificationService.showError(
          'Đăng nhập thất bại!',
          'Email hoặc mật khẩu không chính xác'
        );
      }
    });
  }

  private validateForm(): boolean {
    if (!this.loginForm.email.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập email');
      return false;
    }

    if (!this.loginForm.password.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập mật khẩu');
      return false;
    }

    if (!this.isValidEmail(this.loginForm.email)) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập email hợp lệ');
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  navigateToMainSite(): void {
    this.router.navigate(['/']);
  }
}
