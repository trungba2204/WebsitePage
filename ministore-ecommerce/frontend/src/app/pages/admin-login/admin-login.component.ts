import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent implements OnInit {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  router = inject(Router);

  email = '';
  password = '';
  isLoading = false;

  ngOnInit(): void {
    // Redirect to admin dashboard if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    this.isLoading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Check if user is admin
        if (response.user.role === 'ADMIN') {
          this.notificationService.showSuccess('Thành công!', 'Đăng nhập admin thành công');
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.notificationService.showError('Lỗi!', 'Bạn không có quyền truy cập admin');
          this.authService.logout();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.notificationService.showError('Lỗi!', 'Email hoặc mật khẩu không đúng');
      }
    });
  }

  goToUserLogin(): void {
    this.router.navigate(['/login']);
  }
}
