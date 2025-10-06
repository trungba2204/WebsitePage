import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page container py-5">
      <div class="auth-card">
        <h1>Đăng nhập</h1>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="credentials.email" name="email" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Mật khẩu</label>
            <input type="password" [(ngModel)]="credentials.password" name="password" class="form-control" required />
          </div>
          <button type="submit" class="btn btn-primary w-100" [disabled]="isLoading">
            {{ isLoading ? 'Đang xử lý...' : 'Đăng nhập' }}
          </button>
        </form>
        <p class="text-center mt-3">
          Chưa có tài khoản? <a routerLink="/register">Đăng ký ngay</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 500px; display: flex; align-items: center; justify-content: center; }
    .auth-card { max-width: 400px; width: 100%; background: white; padding: 2rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .form-group { margin-bottom: 1.5rem; }
    .w-100 { width: 100%; }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  
  credentials: LoginRequest = { email: '', password: '' };
  isLoading = false;

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      console.error('❌ LoginComponent onSubmit - Missing credentials');
      return;
    }

    this.isLoading = true;
    console.log('🔍 LoginComponent onSubmit - Attempting user login:', { email: this.credentials.email });

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('✅ LoginComponent onSubmit - User login successful, navigating to home');
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ LoginComponent onSubmit - User login error:', error);
        console.error('❌ Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        
        // Show appropriate error message
        if (error.status === 401) {
          alert('❌ Email hoặc mật khẩu không đúng!\n\n💡 Tài khoản mặc định:\n• Admin: admin@ministore.com / admin123\n• User: Cần đăng ký tài khoản mới');
        } else {
          alert('❌ Lỗi đăng nhập. Vui lòng thử lại!');
        }
      }
    });
  }
}

