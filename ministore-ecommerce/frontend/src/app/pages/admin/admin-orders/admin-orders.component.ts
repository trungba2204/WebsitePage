import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminOrderService, OrderResponse } from '../../../services/admin-order.service';
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
  adminOrderService = inject(AdminOrderService);
  notificationService = inject(NotificationService);

  // Make OrderStatus available in template
  OrderStatus = OrderStatus;

  orders: Order[] = [];
  isLoading = false;
  isUpdating = false;
  updatingOrderId: number | null = null;

  // Confirmation modal
  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmOrderId: number | null = null;
  confirmNewStatus: OrderStatus | null = null;
  isConfirming = false;

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
    
    this.adminOrderService.getAllOrders(this.currentPage, this.pageSize, this.sortBy, this.sortOrder).subscribe({
      next: (response: OrderResponse) => {
        this.orders = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
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
    const currentStatusText = this.getStatusText(order.status);
    
    this.confirmTitle = 'Xác nhận cập nhật trạng thái đơn hàng';
    this.confirmMessage = `Bạn có chắc chắn muốn cập nhật đơn hàng ${order.orderNumber} từ "${currentStatusText}" thành "${statusText}"?`;
    this.confirmOrderId = order.id;
    this.confirmNewStatus = newStatus;
    this.showConfirmModal = true;
  }

  confirmStatusUpdate(): void {
    if (!this.confirmOrderId) return;

    this.isConfirming = true;

    this.adminOrderService.updateOrderStatus(this.confirmOrderId, this.confirmNewStatus as OrderStatus).subscribe({
      next: () => {
        this.isConfirming = false;
        this.showConfirmModal = false;
        this.notificationService.showSuccess(
          'Thành công!', 
          `Đơn hàng đã được cập nhật thành "${this.getStatusText(this.confirmNewStatus!)}"`
        );
        this.loadOrders();
      },
      error: (error) => {
        this.isConfirming = false;
        console.error('Error updating order status:', error);
        this.notificationService.showError('Lỗi!', 'Không thể cập nhật trạng thái đơn hàng');
      }
    });
  }

  cancelStatusUpdate(): void {
    this.showConfirmModal = false;
    this.confirmOrderId = null;
    this.confirmNewStatus = null;
    this.confirmMessage = '';
    this.confirmTitle = '';
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

  deleteOrder(order: Order): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa đơn hàng ${order.orderNumber}? Hành động này không thể hoàn tác.`)) {
      return;
    }

    this.isUpdating = true;
    this.updatingOrderId = order.id;

    this.adminOrderService.deleteOrder(order.id).subscribe({
      next: () => {
        this.isUpdating = false;
        this.updatingOrderId = null;
        this.notificationService.showSuccess('Thành công!', 'Đơn hàng đã được xóa');
        this.loadOrders();
      },
      error: (error) => {
        this.isUpdating = false;
        this.updatingOrderId = null;
        console.error('Error deleting order:', error);
        this.notificationService.showError('Lỗi!', 'Không thể xóa đơn hàng');
      }
    });
  }
}
