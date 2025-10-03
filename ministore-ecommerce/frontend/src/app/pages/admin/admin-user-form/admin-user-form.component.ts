import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notification.service';
import { AdminUser } from '../../../models/admin.model';

@Component({
  selector: 'app-admin-user-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-user-form.component.html',
  styleUrl: './admin-user-form.component.scss'
})
export class AdminUserFormComponent implements OnInit {
  adminService = inject(AdminService);
  notificationService = inject(NotificationService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  isLoading = false;
  isSaving = false;
  isEditMode = false;
  userId: number | null = null;

  userForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
    role: 'USER',
    isActive: true,
    password: '',
    confirmPassword: ''
  };

  roleOptions = [
    { value: 'USER', label: 'Người dùng' },
    { value: 'ADMIN', label: 'Quản trị viên' },
    { value: 'SUPER_ADMIN', label: 'Super Admin' }
  ];

  ngOnInit(): void {
    // Check if we're editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.userId = +id;
      this.loadUser();
    }
  }

  loadUser(): void {
    if (!this.userId) return;

    this.isLoading = true;
    this.adminService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.userForm = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || '',
          avatar: user.avatar || '',
          role: user.role,
          isActive: user.isActive,
          password: '',
          confirmPassword: ''
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.isLoading = false;
        this.notificationService.showError('Lỗi!', 'Không thể tải thông tin người dùng');
        this.router.navigate(['/admin/users']);
      }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;

    const userData = {
      firstName: this.userForm.firstName,
      lastName: this.userForm.lastName,
      email: this.userForm.email,
      phone: this.userForm.phone,
      avatar: this.userForm.avatar,
      role: this.userForm.role,
      isActive: this.userForm.isActive,
      ...(this.userForm.password && { password: this.userForm.password })
    };

    if (this.isEditMode && this.userId) {
      // Update existing user
      this.adminService.updateUser({ id: this.userId, ...userData }).subscribe({
        next: () => {
          this.isSaving = false;
          this.notificationService.showSuccess('Thành công!', 'Người dùng đã được cập nhật');
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error updating user:', error);
          this.notificationService.showError('Lỗi!', 'Không thể cập nhật người dùng');
        }
      });
    } else {
      // Create new user
      this.adminService.createUser({ ...userData, password: this.userForm.password }).subscribe({
        next: () => {
          this.isSaving = false;
          this.notificationService.showSuccess('Thành công!', 'Người dùng đã được tạo');
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error creating user:', error);
          this.notificationService.showError('Lỗi!', 'Không thể tạo người dùng');
        }
      });
    }
  }

  private validateForm(): boolean {
    if (!this.userForm.firstName.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập tên');
      return false;
    }

    if (!this.userForm.lastName.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập họ');
      return false;
    }

    if (!this.userForm.email.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập email');
      return false;
    }

    if (!this.isValidEmail(this.userForm.email)) {
      this.notificationService.showError('Lỗi!', 'Email không hợp lệ');
      return false;
    }

    if (!this.isEditMode && !this.userForm.password) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập mật khẩu');
      return false;
    }

    if (this.userForm.password && this.userForm.password !== this.userForm.confirmPassword) {
      this.notificationService.showError('Lỗi!', 'Mật khẩu xác nhận không khớp');
      return false;
    }

    if (this.userForm.password && this.userForm.password.length < 6) {
      this.notificationService.showError('Lỗi!', 'Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onCancel(): void {
    this.router.navigate(['/admin/users']);
  }

  previewAvatar(): string {
    return this.userForm.avatar || 'assets/images/placeholder-avatar.jpg';
  }

  getInitials(): string {
    return (this.userForm.firstName.charAt(0) + this.userForm.lastName.charAt(0)).toUpperCase();
  }

  getRoleLabel(role: string): string {
    const roleOption = this.roleOptions.find(r => r.value === role);
    return roleOption ? roleOption.label : role;
  }

  generateRandomPassword(): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.userForm.password = password;
    this.userForm.confirmPassword = password;
  }
}
