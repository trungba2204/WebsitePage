import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { AdminUser } from '../../../models/admin.model';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  adminService = inject(AdminService);
  notificationService = inject(NotificationService);

  users: AdminUser[] = [];
  isLoading = false;
  isDeleting = false;
  deletingUserId: number | null = null;

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
  selectedUsers: Set<number> = new Set();
  selectAll = false;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    
    this.adminService.getUsers(this.currentPage, this.pageSize, this.getSortString(), this.searchQuery).subscribe({
      next: (response: any) => {
        this.users = response.content || response;
        this.totalElements = response.totalElements || response.length;
        this.totalPages = response.totalPages || Math.ceil(response.length / this.pageSize);
        this.isLoading = false;
        this.updateSelectAllState();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
        this.notificationService.showError('Lỗi!', 'Không thể tải danh sách người dùng');
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  onSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.currentPage = 0;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  deleteUser(user: AdminUser): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.email}"?`)) {
      return;
    }

    this.isDeleting = true;
    this.deletingUserId = user.id;

    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.deletingUserId = null;
        this.notificationService.showSuccess('Thành công!', 'Người dùng đã được xóa');
        this.loadUsers();
      },
      error: (error) => {
        this.isDeleting = false;
        this.deletingUserId = null;
        console.error('Error deleting user:', error);
        this.notificationService.showError('Lỗi!', 'Không thể xóa người dùng');
      }
    });
  }

  bulkDelete(): void {
    if (this.selectedUsers.size === 0) {
      this.notificationService.showError('Lỗi!', 'Vui lòng chọn ít nhất một người dùng');
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa ${this.selectedUsers.size} người dùng đã chọn?`)) {
      return;
    }

    this.isDeleting = true;
    
    // Delete users one by one
    const deletePromises = Array.from(this.selectedUsers).map(id => 
      this.adminService.deleteUser(id).toPromise()
    );

    Promise.all(deletePromises).then(() => {
      this.isDeleting = false;
      this.selectedUsers.clear();
      this.selectAll = false;
      this.notificationService.showSuccess('Thành công!', `${deletePromises.length} người dùng đã được xóa`);
      this.loadUsers();
    }).catch((error) => {
      this.isDeleting = false;
      console.error('Error bulk deleting users:', error);
      this.notificationService.showError('Lỗi!', 'Có lỗi xảy ra khi xóa người dùng');
    });
  }

  toggleUserSelection(userId: number): void {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
    this.updateSelectAllState();
  }

  toggleSelectAll(): void {
    if (this.selectAll) {
      this.selectedUsers.clear();
    } else {
      this.users.forEach(user => this.selectedUsers.add(user.id));
    }
    this.selectAll = !this.selectAll;
  }

  toggleUserStatus(user: AdminUser): void {
    const newStatus = !user.isActive;
    const statusText = newStatus ? 'kích hoạt' : 'vô hiệu hóa';
    
    if (!confirm(`Bạn có chắc chắn muốn ${statusText} người dùng "${user.email}"?`)) {
      return;
    }

    this.adminService.updateUser({ ...user, isActive: newStatus }).subscribe({
      next: () => {
        this.notificationService.showSuccess('Thành công!', `Người dùng đã được ${statusText}`);
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error updating user status:', error);
        this.notificationService.showError('Lỗi!', 'Không thể cập nhật trạng thái người dùng');
      }
    });
  }

  private updateSelectAllState(): void {
    this.selectAll = this.users.length > 0 && this.users.every(u => this.selectedUsers.has(u.id));
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

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-danger';
      case 'ADMIN':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }

  getRoleText(role: string): string {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'ADMIN':
        return 'Admin';
      default:
        return 'User';
    }
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'bg-success' : 'bg-secondary';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Hoạt động' : 'Vô hiệu hóa';
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

  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }
}
