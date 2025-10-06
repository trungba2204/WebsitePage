import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';
import { BlogService } from '../../../services/blog.service';
import { Product } from '../../../models/product.model';
import { Order } from '../../../models/order.model';
import { Blog } from '../../../models/blog.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  productService = inject(ProductService);
  orderService = inject(OrderService);
  blogService = inject(BlogService);

  // Real data for dashboard stats
  stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalBlogs: 0,
    totalRevenue: 0
  };

  recentOrders: Order[] = [];
  topProducts: any[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load all data in parallel
    Promise.all([
      this.loadProducts(),
      this.loadOrders(),
      this.loadUsers(),
      this.loadBlogs()
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  private loadProducts(): Promise<void> {
    return new Promise((resolve) => {
      this.productService.getProducts().subscribe({
        next: (response: any) => {
          this.stats.totalProducts = response.totalElements || response.length || 0;
          this.calculateTopProducts(response.content || response);
          resolve();
        },
        error: (error: any) => {
          console.error('Error loading products:', error);
          resolve();
        }
      });
    });
  }

  private loadOrders(): Promise<void> {
    return new Promise((resolve) => {
      this.orderService.getUserOrders().subscribe({
        next: (orders: any) => {
          this.stats.totalOrders = orders.length || 0;
          
          this.stats.totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
          this.recentOrders = orders.slice(0, 5); // Get 5 most recent orders
          resolve();
        },
        error: (error: any) => {
          console.error('Error loading orders:', error);
          resolve();
        }
      });
    });
  }

  private loadUsers(): Promise<void> {
    return new Promise((resolve) => {
      // For now, we'll set a default value since we don't have a getUsers API yet
      this.stats.totalUsers = 0;
      resolve();
    });
  }

  private loadBlogs(): Promise<void> {
    return new Promise((resolve) => {
      this.blogService.getBlogs().subscribe({
        next: (response: any) => {
          this.stats.totalBlogs = response.totalElements || response.length || 0;
          resolve();
        },
        error: (error: any) => {
          console.error('Error loading blogs:', error);
          resolve();
        }
      });
    });
  }

  private calculateTopProducts(products: Product[]): void {
    // For now, we'll show the first 3 products as top products
    // In a real app, you'd calculate this based on sales data
    this.topProducts = products.slice(0, 3).map(product => ({
      id: product.id,
      name: product.name,
      sales: Math.floor(Math.random() * 50) + 10, // Mock sales data
      revenue: product.price * (Math.floor(Math.random() * 50) + 10)
    }));
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'badge-warning';
      case 'CONFIRMED':
        return 'badge-info';
      case 'SHIPPING':
        return 'badge-primary';
      case 'DELIVERED':
        return 'badge-success';
      case 'CANCELLED':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'CONFIRMED':
        return 'Đã xác nhận';
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
}