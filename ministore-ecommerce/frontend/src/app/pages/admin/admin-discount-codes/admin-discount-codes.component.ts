import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DiscountCodeService } from '../../../services/discount-code.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmationModalService } from '../../../services/confirmation-modal.service';
import { DiscountCode, CreateDiscountCodeRequest } from '../../../models/discount-code.model';

@Component({
  selector: 'app-admin-discount-codes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-discount-codes.component.html',
  styleUrl: './admin-discount-codes.component.scss'
})
export class AdminDiscountCodesComponent implements OnInit {
  discountCodeService = inject(DiscountCodeService);
  notificationService = inject(NotificationService);
  confirmationService = inject(ConfirmationModalService);
  router = inject(Router);

  discountCodes: DiscountCode[] = [];
  isLoading = false;
  showCreateForm = false;
  isCreating = false;
  isEditing = false;
  editingCode: DiscountCode | null = null;

  // Form data
  formData: CreateDiscountCodeRequest = {
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    startDate: '',
    endDate: '',
    usageLimit: 0,
    isActive: true
  };

  ngOnInit(): void {
    this.loadDiscountCodes();
  }

  loadDiscountCodes(): void {
    this.isLoading = true;
    this.discountCodeService.getAllDiscountCodes().subscribe({
      next: (codes) => {
        this.discountCodes = codes;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading discount codes:', error);
        this.isLoading = false;
        this.notificationService.showError('Lỗi!', 'Không thể tải danh sách mã giảm giá');
      }
    });
  }

  showCreateFormDialog(): void {
    this.showCreateForm = true;
    this.isEditing = false;
    this.editingCode = null;
    this.resetForm();
  }

  showEditForm(code: DiscountCode): void {
    this.showCreateForm = true;
    this.isEditing = true;
    this.editingCode = code;
    this.formData = {
      code: code.code,
      discountType: code.discountType,
      discountValue: code.discountValue,
      minOrderAmount: code.minOrderAmount,
      maxDiscountAmount: code.maxDiscountAmount,
      startDate: code.startDate.split('T')[0],
      endDate: code.endDate.split('T')[0],
      usageLimit: code.usageLimit,
      isActive: code.isActive
    };
  }

  hideCreateForm(): void {
    this.showCreateForm = false;
    this.isEditing = false;
    this.editingCode = null;
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      minOrderAmount: 0,
      maxDiscountAmount: 0,
      startDate: '',
      endDate: '',
      usageLimit: 0,
      isActive: true
    };
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isCreating = true;

    if (this.isEditing && this.editingCode) {
      this.discountCodeService.updateDiscountCode(this.editingCode.id, this.formData).subscribe({
        next: () => {
          this.isCreating = false;
          this.notificationService.showSuccess('Thành công!', 'Mã giảm giá đã được cập nhật');
          this.hideCreateForm();
          this.loadDiscountCodes();
        },
        error: (error) => {
          this.isCreating = false;
          console.error('Error updating discount code:', error);
          this.notificationService.showError('Lỗi!', 'Không thể cập nhật mã giảm giá');
        }
      });
    } else {
      this.discountCodeService.createDiscountCode(this.formData).subscribe({
        next: () => {
          this.isCreating = false;
          this.notificationService.showSuccess('Thành công!', 'Mã giảm giá đã được tạo');
          this.hideCreateForm();
          this.loadDiscountCodes();
        },
        error: (error) => {
          this.isCreating = false;
          console.error('Error creating discount code:', error);
          this.notificationService.showError('Lỗi!', 'Không thể tạo mã giảm giá');
        }
      });
    }
  }

  deleteDiscountCode(code: DiscountCode): void {
    if (confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${code.code}"?`)) {
      this.discountCodeService.deleteDiscountCode(code.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Thành công!', 'Mã giảm giá đã được xóa');
          this.loadDiscountCodes();
        },
        error: (error) => {
          console.error('Error deleting discount code:', error);
          this.notificationService.showError('Lỗi!', 'Không thể xóa mã giảm giá');
        }
      });
    }
  }

  private validateForm(): boolean {
    if (!this.formData.code.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập mã giảm giá');
      return false;
    }
    if (this.formData.discountValue <= 0) {
      this.notificationService.showError('Lỗi!', 'Giá trị giảm giá phải lớn hơn 0');
      return false;
    }
    if (!this.formData.startDate) {
      this.notificationService.showError('Lỗi!', 'Vui lòng chọn ngày bắt đầu');
      return false;
    }
    if (!this.formData.endDate) {
      this.notificationService.showError('Lỗi!', 'Vui lòng chọn ngày kết thúc');
      return false;
    }
    if (new Date(this.formData.startDate) >= new Date(this.formData.endDate)) {
      this.notificationService.showError('Lỗi!', 'Ngày kết thúc phải sau ngày bắt đầu');
      return false;
    }
    return true;
  }

  getStatusText(code: DiscountCode): string {
    const now = new Date();
    const startDate = new Date(code.startDate);
    const endDate = new Date(code.endDate);

    if (!code.isActive) {
      return 'Tạm khóa';
    }
    if (now < startDate) {
      return 'Chưa bắt đầu';
    }
    if (now > endDate) {
      return 'Đã hết hạn';
    }
    if (code.usageLimit && code.usedCount >= code.usageLimit) {
      return 'Đã hết lượt';
    }
    return 'Đang hoạt động';
  }

  getStatusClass(code: DiscountCode): string {
    const status = this.getStatusText(code);
    switch (status) {
      case 'Đang hoạt động': return 'badge bg-success';
      case 'Chưa bắt đầu': return 'badge bg-info';
      case 'Đã hết hạn': return 'badge bg-secondary';
      case 'Đã hết lượt': return 'badge bg-warning';
      case 'Tạm khóa': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN');
  }
}
