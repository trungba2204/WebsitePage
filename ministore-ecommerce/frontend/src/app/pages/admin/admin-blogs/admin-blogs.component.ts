import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Blog } from '../../../models/blog.model';
import { BlogResponse } from '../../../services/blog.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmationModalService } from '../../../services/confirmation-modal.service';

@Component({
  selector: 'app-admin-blogs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-blogs.component.html',
  styleUrl: './admin-blogs.component.scss'
})
export class AdminBlogsComponent implements OnInit {
  adminService = inject(AdminService);
  notificationService = inject(NotificationService);
  confirmationService = inject(ConfirmationModalService);

  blogs: Blog[] = [];
  isLoading = false;
  isDeleting = false;
  deletingBlogId: number | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Filters
  searchQuery = '';
  sortBy = 'id';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Bulk actions
  selectedBlogs: Set<number> = new Set();
  selectAll = false;

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.isLoading = true;
    
    this.adminService.getBlogs(this.currentPage, this.pageSize, this.getSortString(), this.searchQuery).subscribe({
      next: (response: BlogResponse) => {
        this.blogs = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLoading = false;
        this.updateSelectAllState();
      },
      error: (error) => {
        console.error('Error loading blogs:', error);
        this.isLoading = false;
        this.notificationService.showError('Lỗi!', 'Không thể tải danh sách blog');
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadBlogs();
  }

  onSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.currentPage = 0;
    this.loadBlogs();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadBlogs();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadBlogs();
  }

  async deleteBlog(blog: Blog): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa bài viết "${blog.title}"?`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      confirmClass: 'btn-danger'
    });

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;
    this.deletingBlogId = blog.id;

    this.adminService.deleteBlog(blog.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deletingBlogId = null;
        this.notificationService.showSuccess('Thành công!', 'Bài viết đã được xóa');
        this.loadBlogs();
      },
      error: (error) => {
        this.isDeleting = false;
        this.deletingBlogId = null;
        console.error('Error deleting blog:', error);
        this.notificationService.showError('Lỗi!', 'Không thể xóa bài viết');
      }
    });
  }

  async bulkDelete(): Promise<void> {
    if (this.selectedBlogs.size === 0) {
      this.notificationService.showError('Lỗi!', 'Vui lòng chọn ít nhất một bài viết');
      
      return;
    }

    const confirmed = await this.confirmationService.show({
      title: 'Xác nhận xóa nhiều',
      message: `Bạn có chắc chắn muốn xóa ${this.selectedBlogs.size} bài viết đã chọn?`,
      confirmText: 'Xóa tất cả',
      cancelText: 'Hủy',
      confirmClass: 'btn-danger'
    });

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;
    
    // Delete blogs one by one
    const deletePromises = Array.from(this.selectedBlogs).map(id => 
      this.adminService.deleteBlog(id).toPromise()
    );

    Promise.all(deletePromises).then(() => {
      this.isDeleting = false;
      this.selectedBlogs.clear();
      this.selectAll = false;
      this.notificationService.showSuccess('Thành công!', `${deletePromises.length} bài viết đã được xóa`);
      this.loadBlogs();
    }).catch((error) => {
      this.isDeleting = false;
      console.error('Error bulk deleting blogs:', error);
      this.notificationService.showError('Lỗi!', 'Có lỗi xảy ra khi xóa bài viết');
    });
  }

  toggleBlogSelection(blogId: number): void {
    if (this.selectedBlogs.has(blogId)) {
      this.selectedBlogs.delete(blogId);
    } else {
      this.selectedBlogs.add(blogId);
    }
    this.updateSelectAllState();
  }

  toggleSelectAll(): void {
    if (this.selectAll) {
      this.selectedBlogs.clear();
    } else {
      this.blogs.forEach(blog => this.selectedBlogs.add(blog.id));
    }
    this.selectAll = !this.selectAll;
  }

  private updateSelectAllState(): void {
    this.selectAll = this.blogs.length > 0 && this.blogs.every(b => this.selectedBlogs.has(b.id));
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

  getStatusBadgeClass(published: boolean): string {
    return published ? 'bg-success' : 'bg-warning';
  }

  getStatusText(published: boolean): string {
    return published ? 'Đã xuất bản' : 'Bản nháp';
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

  truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
