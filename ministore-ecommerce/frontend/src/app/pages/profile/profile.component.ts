import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';
import { Order } from '../../models/order.model';
import { ImageFallbackDirective } from '../../directives/image-fallback.directive';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ImageFallbackDirective],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  orderService = inject(OrderService);
  notificationService = inject(NotificationService);
  
  user: User | null = null;
  recentOrders: Order[] = [];
  isLoading = false;
  isEditing = false;
  isUploadingAvatar = false;
  
  // Form data for editing
  editForm = {
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  };

  ngOnInit(): void {
    this.user = this.authService.currentUser();
    if (this.user) {
      this.loadRecentOrders();
      this.initEditForm();
    }
  }

  private initEditForm(): void {
    if (this.user) {
      this.editForm = {
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        phone: this.user.phone || '',
        email: this.user.email || ''
      };
    }
  }

  private loadRecentOrders(): void {
    this.isLoading = true;
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.recentOrders = orders.slice(0, 5); // Show only recent 5 orders
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.initEditForm(); // Reset form if canceling
    }
  }

  saveProfile(): void {
    if (!this.user) return;
    
    // Here you would typically call an API to update user profile
    // For now, we'll just update the local user object
    this.user = {
      ...this.user,
      firstName: this.editForm.firstName,
      lastName: this.editForm.lastName,
      phone: this.editForm.phone,
      email: this.editForm.email
    };
    
    this.isEditing = false;
    // TODO: Show success notification
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'processing': return 'status-processing';
      case 'shipping': return 'status-shipping';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'shipping': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getTotalSpent(): string {
    const total = this.recentOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    return this.formatPrice(total);
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.showError(
          'Lỗi định dạng file',
          'Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF, WEBP)'
        );
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.showError(
          'File quá lớn',
          'Kích thước file không được vượt quá 5MB'
        );
        return;
      }

      this.uploadAvatar(file);
    }
  }

  private uploadAvatar(file: File): void {
    this.isUploadingAvatar = true;
    
    this.authService.uploadAvatar(file).subscribe({
      next: (updatedUser) => {
        console.log('✅ Avatar uploaded successfully:', updatedUser);
        this.user = updatedUser;
        this.isUploadingAvatar = false;
        
        // Show success notification
        this.notificationService.showSuccess(
          'Thành công!',
          'Ảnh đại diện đã được cập nhật thành công'
        );
      },
      error: (error) => {
        console.error('❌ Error uploading avatar:', error);
        this.isUploadingAvatar = false;
        
        // Show error notification
        this.notificationService.showError(
          'Lỗi upload',
          'Có lỗi xảy ra khi đổi ảnh đại diện. Vui lòng thử lại.'
        );
      }
    });
  }

  getFallbackImage(): string {
    if (this.user) {
      const initials = (this.user.firstName?.charAt(0) || '') + (this.user.lastName?.charAt(0) || '');
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="60" fill="#007bff"/>
          <text x="60" y="70" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">${initials}</text>
        </svg>
      `)}`;
    }
    return '';
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
}

