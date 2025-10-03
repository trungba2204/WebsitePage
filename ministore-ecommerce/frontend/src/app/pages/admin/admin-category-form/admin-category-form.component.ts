import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notification.service';
import { Category } from '../../../models/product.model';
import { CreateCategoryRequest, UpdateCategoryRequest } from '../../../models/admin.model';

@Component({
  selector: 'app-admin-category-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-category-form.component.html',
  styleUrl: './admin-category-form.component.scss'
})
export class AdminCategoryFormComponent implements OnInit {
  adminService = inject(AdminService);
  notificationService = inject(NotificationService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  isLoading = false;
  isSaving = false;
  isEditMode = false;
  categoryId: number | null = null;

  categoryForm = {
    name: '',
    description: '',
    imageUrl: ''
  };

  ngOnInit(): void {
    // Check if we're editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.categoryId = +id;
      this.loadCategory();
    }
  }

  loadCategory(): void {
    if (!this.categoryId) return;

    this.isLoading = true;
    this.adminService.getCategoryById(this.categoryId).subscribe({
      next: (category) => {
        this.categoryForm = {
          name: category.name,
          description: category.description || '',
          imageUrl: category.imageUrl || ''
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading category:', error);
        this.isLoading = false;
        this.notificationService.showError('Lỗi!', 'Không thể tải thông tin danh mục');
        this.router.navigate(['/admin/categories']);
      }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;

    if (this.isEditMode && this.categoryId) {
      // Update existing category
      const updateRequest: UpdateCategoryRequest = {
        id: this.categoryId,
        ...this.categoryForm
      };

      this.adminService.updateCategory(updateRequest).subscribe({
        next: () => {
          this.isSaving = false;
          this.notificationService.showSuccess('Thành công!', 'Danh mục đã được cập nhật');
          this.router.navigate(['/admin/categories']);
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error updating category:', error);
          this.notificationService.showError('Lỗi!', 'Không thể cập nhật danh mục');
        }
      });
    } else {
      // Create new category
      const createRequest: CreateCategoryRequest = {
        ...this.categoryForm
      };

      this.adminService.createCategory(createRequest).subscribe({
        next: () => {
          this.isSaving = false;
          this.notificationService.showSuccess('Thành công!', 'Danh mục đã được tạo');
          this.router.navigate(['/admin/categories']);
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error creating category:', error);
          this.notificationService.showError('Lỗi!', 'Không thể tạo danh mục');
        }
      });
    }
  }

  private validateForm(): boolean {
    if (!this.categoryForm.name.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập tên danh mục');
      return false;
    }

    return true;
  }

  onCancel(): void {
    this.router.navigate(['/admin/categories']);
  }

  previewImage(): string {
    return this.categoryForm.imageUrl || 'assets/images/placeholder-category.jpg';
  }
}
