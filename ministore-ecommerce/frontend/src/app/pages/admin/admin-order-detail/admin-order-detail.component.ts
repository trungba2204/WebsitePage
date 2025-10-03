import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notification.service';
import { Order, OrderStatus } from '../../../models/order.model';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-order-detail.component.html',
  styleUrl: './admin-order-detail.component.scss'
})
export class AdminOrderDetailComponent implements OnInit {
  adminService = inject(AdminService);
  notificationService = inject(NotificationService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  order: Order | null = null;
  isLoading = false;
  isUpdating = false;

  // Status options
  statusOptions = [
    { value: 'PENDING', label: 'Chờ xử lý', class: 'bg-warning' },
    { value: 'CONFIRMED', label: 'Đã xác nhận', class: 'bg-info' },
    { value: 'PROCESSING', label: 'Đang xử lý', class: 'bg-primary' },
    { value: 'SHIPPING', label: 'Đang giao', class: 'bg-secondary' },
    { value: 'DELIVERED', label: 'Đã giao', class: 'bg-success' },
    { value: 'CANCELLED', label: 'Đã hủy', class: 'bg-danger' }
  ];

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(+orderId);
    } else {
      this.router.navigate(['/admin/orders']);
    }
  }

  loadOrder(orderId: number): void {
    this.isLoading = true;
    this.adminService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.isLoading = false;
        this.notificationService.showError('Lỗi!', 'Không thể tải thông tin đơn hàng');
        this.router.navigate(['/admin/orders']);
      }
    });
  }

  updateOrderStatus(newStatus: string): void {
    if (!this.order) return;

    const statusText = this.getStatusText(newStatus);
    
    if (!confirm(`Bạn có chắc chắn muốn cập nhật đơn hàng ${this.order.orderNumber} thành "${statusText}"?`)) {
      return;
    }

    this.isUpdating = true;

    this.adminService.updateOrderStatus(this.order.id, newStatus).subscribe({
      next: () => {
        this.isUpdating = false;
        this.notificationService.showSuccess('Thành công!', 'Trạng thái đơn hàng đã được cập nhật');
        this.loadOrder(this.order!.id);
      },
      error: (error) => {
        this.isUpdating = false;
        console.error('Error updating order status:', error);
        this.notificationService.showError('Lỗi!', 'Không thể cập nhật trạng thái đơn hàng');
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  getStatusBadgeClass(status: OrderStatus): string {
    const statusOption = this.statusOptions.find(s => s.value === status);
    return statusOption ? statusOption.class : 'bg-secondary';
  }

  getStatusText(status: string): string {
    const statusOption = this.statusOptions.find(s => s.value === status);
    return statusOption ? statusOption.label : status;
  }

  getPaymentMethodText(method: string): string {
    switch (method) {
      case 'cod':
        return 'Thanh toán khi nhận hàng';
      case 'bank_transfer':
        return 'Chuyển khoản ngân hàng';
      case 'credit_card':
        return 'Thẻ tín dụng';
      default:
        return method;
    }
  }

  getPaymentMethodIcon(method: string): string {
    switch (method) {
      case 'cod':
        return 'bi-cash';
      case 'bank_transfer':
        return 'bi-bank';
      case 'credit_card':
        return 'bi-credit-card';
      default:
        return 'bi-wallet';
    }
  }

  canUpdateStatus(): boolean {
    return this.order ? this.order.status !== 'DELIVERED' && this.order.status !== 'CANCELLED' : false;
  }

  goBack(): void {
    this.router.navigate(['/admin/orders']);
  }

  printOrder(): void {
    window.print();
  }
}