import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Category } from '../../../models/product.model';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.scss'
})
export class AdminCategoriesComponent implements OnInit {
  adminService = inject(AdminService);
  notificationService = inject(NotificationService);

  categories: Category[] = [];
  isLoading = false;
  isDeleting = false;
  deletingCategoryId: number | null = null;

  // Search
  searchQuery = '';

  // Bulk actions
  selectedCategories: Set<number> = new Set();
  selectAll = false;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    
    this.adminService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
        this.updateSelectAllState();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoading = false;
        this.notificationService.showError('Lỗi!', 'Không thể tải danh sách danh mục');
      }
    });
  }

  onSearch(): void {
    // Filter categories locally
    this.updateSelectAllState();
  }

  getFilteredCategories(): Category[] {
    if (!this.searchQuery.trim()) {
      return this.categories;
    }
    
    return this.categories.filter(category =>
      category.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
  }

  deleteCategory(category: Category): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
      return;
    }

    this.isDeleting = true;
    this.deletingCategoryId = category.id;

    this.adminService.deleteCategory(category.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deletingCategoryId = null;
        this.notificationService.showSuccess('Thành công!', 'Danh mục đã được xóa');
        this.loadCategories();
      },
      error: (error) => {
        this.isDeleting = false;
        this.deletingCategoryId = null;
        console.error('Error deleting category:', error);
        this.notificationService.showError('Lỗi!', 'Không thể xóa danh mục');
      }
    });
  }

  bulkDelete(): void {
    if (this.selectedCategories.size === 0) {
      this.notificationService.showError('Lỗi!', 'Vui lòng chọn ít nhất một danh mục');
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa ${this.selectedCategories.size} danh mục đã chọn?`)) {
      return;
    }

    this.isDeleting = true;
    
    // Delete categories one by one
    const deletePromises = Array.from(this.selectedCategories).map(id => 
      this.adminService.deleteCategory(id).toPromise()
    );

    Promise.all(deletePromises).then(() => {
      this.isDeleting = false;
      this.selectedCategories.clear();
      this.selectAll = false;
      this.notificationService.showSuccess('Thành công!', `${deletePromises.length} danh mục đã được xóa`);
      this.loadCategories();
    }).catch((error) => {
      this.isDeleting = false;
      console.error('Error bulk deleting categories:', error);
      this.notificationService.showError('Lỗi!', 'Có lỗi xảy ra khi xóa danh mục');
    });
  }

  toggleCategorySelection(categoryId: number): void {
    if (this.selectedCategories.has(categoryId)) {
      this.selectedCategories.delete(categoryId);
    } else {
      this.selectedCategories.add(categoryId);
    }
    this.updateSelectAllState();
  }

  toggleSelectAll(): void {
    const filteredCategories = this.getFilteredCategories();
    if (this.selectAll) {
      this.selectedCategories.clear();
    } else {
      filteredCategories.forEach(category => this.selectedCategories.add(category.id));
    }
    this.selectAll = !this.selectAll;
  }

  private updateSelectAllState(): void {
    const filteredCategories = this.getFilteredCategories();
    this.selectAll = filteredCategories.length > 0 && 
                     filteredCategories.every(c => this.selectedCategories.has(c.id));
  }
}
