import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
})
export class AdminOrdersComponent implements OnInit {
  adminService = inject(AdminService);
  notificationService = inject(NotificationService);

  // Make OrderStatus available in template
  OrderStatus = OrderStatus;

  orders: Order[] = [];
  isLoading = false;
  isUpdating = false;
  updatingOrderId: number | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Filters
  searchQuery = '';
  statusFilter = '';
  sortBy = 'id';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Status options
  statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'PROCESSING', label: 'Đang xử lý' },
    { value: 'SHIPPING', label: 'Đang giao' },
    { value: 'DELIVERED', label: 'Đã giao' },
    { value: 'CANCELLED', label: 'Đã hủy' }
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    
    this.adminService.getOrders(this.currentPage, this.pageSize, this.getSortString(), this.searchQuery).subscribe({
      next: (response: any) => {
        this.orders = response.content || response;
        this.totalElements = response.totalElements || response.length;
        this.totalPages = response.totalPages || Math.ceil(response.length / this.pageSize);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
        this.notificationService.showError('Lỗi!', 'Không thể tải danh sách đơn hàng');
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadOrders();
  }

  onStatusFilterChange(): void {
    this.currentPage = 0;
    this.loadOrders();
  }

  onSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.currentPage = 0;
    this.loadOrders();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadOrders();
  }

  updateOrderStatus(order: Order, newStatus: OrderStatus): void {
    const statusText = this.getStatusText(newStatus);
    
    if (!confirm(`Bạn có chắc chắn muốn cập nhật đơn hàng ${order.orderNumber} thành "${statusText}"?`)) {
      return;
    }

    this.isUpdating = true;
    this.updatingOrderId = order.id;

    this.adminService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        this.isUpdating = false;
        this.updatingOrderId = null;
        this.notificationService.showSuccess('Thành công!', 'Trạng thái đơn hàng đã được cập nhật');
        this.loadOrders();
      },
      error: (error) => {
        this.isUpdating = false;
        this.updatingOrderId = null;
        console.error('Error updating order status:', error);
        this.notificationService.showError('Lỗi!', 'Không thể cập nhật trạng thái đơn hàng');
      }
    });
  }

  private getSortString(): string {
    return `${this.sortBy},${this.sortOrder}`;
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) return 'bi-arrow-down-up';
    return this.sortOrder === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN');
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'PENDING':
        return 'bg-warning';
      case 'CONFIRMED':
        return 'bg-info';
      case 'PROCESSING':
        return 'bg-primary';
      case 'SHIPPING':
        return 'bg-secondary';
      case 'DELIVERED':
        return 'bg-success';
      case 'CANCELLED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusText(status: OrderStatus): string {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'SHIPPING':
        return 'Đang giao';
      case 'DELIVERED':
        return 'Đã giao';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
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

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(0, this.currentPage - 2);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getEndIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  getOrderItemsCount(order: Order): number {
    return order.items?.length || 0;
  }

  getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
    switch (currentStatus) {
      case OrderStatus.PENDING:
        return OrderStatus.CONFIRMED;
      case OrderStatus.CONFIRMED:
        return OrderStatus.PROCESSING;
      case OrderStatus.PROCESSING:
        return OrderStatus.SHIPPING;
      case OrderStatus.SHIPPING:
        return OrderStatus.DELIVERED;
      default:
        return null;
    }
  }

  getNextStatusText(currentStatus: OrderStatus): string {
    const nextStatus = this.getNextStatus(currentStatus);
    return nextStatus ? this.getStatusText(nextStatus) : '';
  }

  canUpdateStatus(order: Order): boolean {
    return order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
  }
}
