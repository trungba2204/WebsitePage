import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notification.service';
import { Blog } from '../../../models/blog.model';
import { CreateBlogRequest, UpdateBlogRequest } from '../../../models/admin.model';

@Component({
  selector: 'app-admin-blog-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-blog-form.component.html',
  styleUrl: './admin-blog-form.component.scss'
})
export class AdminBlogFormComponent implements OnInit {
  adminService = inject(AdminService);
  notificationService = inject(NotificationService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  isLoading = false;
  isSaving = false;
  isEditMode = false;
  blogId: number | null = null;

  blogForm = {
    title: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    author: '',
    authorAvatar: '',
    category: '',
    tags: [] as string[],
    published: false
  };

  tagInput = '';

  ngOnInit(): void {
    // Check if we're editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.blogId = +id;
      this.loadBlog();
    }
  }

  loadBlog(): void {
    if (!this.blogId) return;

    this.isLoading = true;
    this.adminService.getBlogById(this.blogId).subscribe({
      next: (blog) => {
        this.blogForm = {
          title: blog.title,
          content: blog.content,
          excerpt: blog.excerpt,
          imageUrl: blog.imageUrl,
          author: blog.author,
          authorAvatar: blog.authorAvatar || '',
          category: blog.category,
          tags: blog.tags || [],
          published: blog.published
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading blog:', error);
        this.isLoading = false;
        this.notificationService.showError('Lỗi!', 'Không thể tải thông tin bài viết');
        this.router.navigate(['/admin/blogs']);
      }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;

    if (this.isEditMode && this.blogId) {
      // Update existing blog
      const updateRequest: UpdateBlogRequest = {
        id: this.blogId,
        ...this.blogForm
      };

      this.adminService.updateBlog(updateRequest).subscribe({
        next: () => {
          this.isSaving = false;
          this.notificationService.showSuccess('Thành công!', 'Bài viết đã được cập nhật');
          this.router.navigate(['/admin/blogs']);
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error updating blog:', error);
          this.notificationService.showError('Lỗi!', 'Không thể cập nhật bài viết');
        }
      });
    } else {
      // Create new blog
      const createRequest: CreateBlogRequest = {
        ...this.blogForm
      };

      this.adminService.createBlog(createRequest).subscribe({
        next: () => {
          this.isSaving = false;
          this.notificationService.showSuccess('Thành công!', 'Bài viết đã được tạo');
          this.router.navigate(['/admin/blogs']);
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error creating blog:', error);
          this.notificationService.showError('Lỗi!', 'Không thể tạo bài viết');
        }
      });
    }
  }

  private validateForm(): boolean {
    if (!this.blogForm.title.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập tiêu đề bài viết');
      return false;
    }

    if (!this.blogForm.content.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập nội dung bài viết');
      return false;
    }

    if (!this.blogForm.excerpt.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập tóm tắt bài viết');
      return false;
    }

    if (!this.blogForm.author.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập tên tác giả');
      return false;
    }

    if (!this.blogForm.category.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập danh mục');
      return false;
    }

    return true;
  }

  onCancel(): void {
    this.router.navigate(['/admin/blogs']);
  }

  addTag(): void {
    const tag = this.tagInput.trim();
    if (tag && !this.blogForm.tags.includes(tag)) {
      this.blogForm.tags.push(tag);
      this.tagInput = '';
    }
  }

  removeTag(tag: string): void {
    this.blogForm.tags = this.blogForm.tags.filter(t => t !== tag);
  }

  onTagInputKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  previewImage(): string {
    return this.blogForm.imageUrl || 'assets/images/placeholder-blog.jpg';
  }

  previewAuthorAvatar(): string {
    return this.blogForm.authorAvatar || 'assets/images/placeholder-avatar.jpg';
  }

  generateExcerpt(): void {
    if (this.blogForm.content) {
      this.blogForm.excerpt = this.blogForm.content.substring(0, 200) + '...';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN');
  }
}
