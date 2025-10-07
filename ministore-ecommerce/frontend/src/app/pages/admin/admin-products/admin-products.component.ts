import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Product, ProductResponse } from '../../../models/product.model';
import { Category } from '../../../models/product.model';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmationModalService } from '../../../services/confirmation-modal.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss'
})
export class AdminProductsComponent implements OnInit {
  adminService = inject(AdminService);
  notificationService = inject(NotificationService);
  confirmationService = inject(ConfirmationModalService);

  products: Product[] = [];
  categories: Category[] = [];
  isLoading = false;
  isDeleting = false;
  deletingProductId: number | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Filters
  searchQuery = '';
  selectedCategoryId: number | null = null;
  sortBy = 'id';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Bulk actions
  selectedProducts: Set<number> = new Set();
  selectAll = false;

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    
    this.adminService.getProducts(this.currentPage, this.pageSize, this.getSortString(), this.searchQuery).subscribe({
      next: (response: ProductResponse) => {
        this.products = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLoading = false;
        this.updateSelectAllState();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
        this.notificationService.showError('Lỗi!', 'Không thể tải danh sách sản phẩm');
      }
    });
  }

  loadCategories(): void {
    this.adminService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  onCategoryFilter(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  onSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.currentPage = 0;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  async deleteProduct(product: Product): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Xác nhận xóa sản phẩm',
      message: `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      confirmClass: 'btn-danger'
    });

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;
    this.deletingProductId = product.id;

    this.adminService.deleteProduct(product.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deletingProductId = null;
        this.notificationService.showSuccess('Thành công!', 'Sản phẩm đã được xóa');
        this.loadProducts();
      },
      error: (error) => {
        this.isDeleting = false;
        this.deletingProductId = null;
        console.error('Error deleting product:', error);
        this.notificationService.showError('Lỗi!', 'Không thể xóa sản phẩm');
      }
    });
  }

  async bulkDelete(): Promise<void> {
    if (this.selectedProducts.size === 0) {
      this.notificationService.showError('Lỗi!', 'Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    const confirmed = await this.confirmationService.show({
      title: 'Xác nhận xóa nhiều sản phẩm',
      message: `Bạn có chắc chắn muốn xóa ${this.selectedProducts.size} sản phẩm đã chọn?`,
      confirmText: 'Xóa tất cả',
      cancelText: 'Hủy',
      confirmClass: 'btn-danger'
    });

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;
    
    // Delete products one by one (in real app, you'd have bulk delete API)
    const deletePromises = Array.from(this.selectedProducts).map(id => 
      this.adminService.deleteProduct(id).toPromise()
    );

    Promise.all(deletePromises).then(() => {
      this.isDeleting = false;
      this.selectedProducts.clear();
      this.selectAll = false;
      this.notificationService.showSuccess('Thành công!', `${deletePromises.length} sản phẩm đã được xóa`);
      this.loadProducts();
    }).catch((error) => {
      this.isDeleting = false;
      console.error('Error bulk deleting products:', error);
      this.notificationService.showError('Lỗi!', 'Có lỗi xảy ra khi xóa sản phẩm');
    });
  }

  toggleProductSelection(productId: number): void {
    if (this.selectedProducts.has(productId)) {
      this.selectedProducts.delete(productId);
    } else {
      this.selectedProducts.add(productId);
    }
    this.updateSelectAllState();
  }

  toggleSelectAll(): void {
    if (this.selectAll) {
      this.selectedProducts.clear();
    } else {
      this.products.forEach(product => this.selectedProducts.add(product.id));
    }
    this.selectAll = !this.selectAll;
  }

  private updateSelectAllState(): void {
    this.selectAll = this.products.length > 0 && this.products.every(p => this.selectedProducts.has(p.id));
  }

  private getSortString(): string {
    return `${this.sortBy},${this.sortOrder}`;
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) return 'bi-arrow-down-up';
    return this.sortOrder === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'N/A';
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
}
