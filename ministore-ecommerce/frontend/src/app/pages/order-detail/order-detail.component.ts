import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models/order.model';
import { ImageFallbackDirective } from '../../directives/image-fallback.directive';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, ImageFallbackDirective],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent implements OnInit {
  orderService = inject(OrderService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  order: Order | null = null;
  isLoading = true;
  error: string | null = null;
  orderId: number | null = null;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      if (this.orderId) {
        this.loadOrderDetail();
      }
    });

    // Check for success parameter from checkout
    this.route.queryParams.subscribe(params => {
      if (params['success'] === 'true') {
        // TODO: Show success message
        console.log('Order created successfully!');
      }
    });
  }

  loadOrderDetail(): void {
    if (!this.orderId) return;

    this.isLoading = true;
    this.error = null;

    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        console.log('🔍 Order detail received:', order);
        
        this.order = order;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading order detail:', error);
        this.error = 'Không thể tải chi tiết đơn hàng';
        this.isLoading = false;
      }
    });
  }

  getStatusText(status: OrderStatus): string {
    const statusMap: { [key in OrderStatus]: string } = {
      [OrderStatus.PENDING]: 'Chờ xác nhận',
      [OrderStatus.CONFIRMED]: 'Đã xác nhận',
      [OrderStatus.PROCESSING]: 'Đang xử lý',
      [OrderStatus.SHIPPING]: 'Đang giao hàng',
      [OrderStatus.DELIVERED]: 'Đã giao hàng',
      [OrderStatus.CANCELLED]: 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: OrderStatus): string {
    const classMap: { [key in OrderStatus]: string } = {
      [OrderStatus.PENDING]: 'badge-warning',
      [OrderStatus.CONFIRMED]: 'badge-info',
      [OrderStatus.PROCESSING]: 'badge-primary',
      [OrderStatus.SHIPPING]: 'badge-success',
      [OrderStatus.DELIVERED]: 'badge-success',
      [OrderStatus.CANCELLED]: 'badge-danger'
    };
    return classMap[status] || 'badge-secondary';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
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

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
