import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notification.service';
import { Category } from '../../../models/product.model';
import { CreateProductRequest, UpdateProductRequest } from '../../../models/admin.model';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-product-form.component.html',
  styleUrl: './admin-product-form.component.scss'
})
export class AdminProductFormComponent implements OnInit {
  adminService = inject(AdminService);
  notificationService = inject(NotificationService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  categories: Category[] = [];
  isLoading = false;
  isSaving = false;
  isEditMode = false;
  productId: number | null = null;
  selectedImageFile: File | null = null;
  selectedImagePreview: string | null = null;

  productForm = {
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    categoryId: 0,
    stock: 0,
    rating: 0,
    reviews: 0
  };

  ngOnInit(): void {
    this.loadCategories();
    
    // Check if we're editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.productId = +id;
      this.loadProduct();
    }
  }

  loadCategories(): void {
    this.adminService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        if (categories.length > 0 && !this.productForm.categoryId) {
          this.productForm.categoryId = categories[0].id;
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.notificationService.showError('Lỗi!', 'Không thể tải danh mục');
      }
    });
  }

  loadProduct(): void {
    if (!this.productId) return;

    this.isLoading = true;
    this.adminService.getProductById(this.productId).subscribe({
      next: (product) => {
        this.productForm = {
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl,
          categoryId: product.category.id,
          stock: product.stock,
          rating: product.rating || 0,
          reviews: product.reviews || 0
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.isLoading = false;
        this.notificationService.showError('Lỗi!', 'Không thể tải thông tin sản phẩm');
        this.router.navigate(['/admin/products']);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;

    try {
      // Handle image upload first
      if (this.selectedImageFile) {
        const uploadedImageUrl = await this.uploadImage();
        if (uploadedImageUrl) {
          this.productForm.imageUrl = uploadedImageUrl;
        }
      }

      if (this.isEditMode && this.productId) {
        // Update existing product
        const updateRequest: UpdateProductRequest = {
          id: this.productId,
          ...this.productForm
        };

        this.adminService.updateProduct(updateRequest).subscribe({
          next: () => {
            this.isSaving = false;
            this.notificationService.showSuccess('Thành công!', 'Sản phẩm đã được cập nhật');
            this.router.navigate(['/admin/products']);
          },
          error: (error) => {
            this.isSaving = false;
            console.error('Error updating product:', error);
            this.notificationService.showError('Lỗi!', 'Không thể cập nhật sản phẩm');
          }
        });
      } else {
        // Create new product
        const createRequest: CreateProductRequest = {
          ...this.productForm
        };

        this.adminService.createProduct(createRequest).subscribe({
          next: () => {
            this.isSaving = false;
            this.notificationService.showSuccess('Thành công!', 'Sản phẩm đã được tạo');
            this.router.navigate(['/admin/products']);
          },
          error: (error) => {
            this.isSaving = false;
            console.error('Error creating product:', error);
            this.notificationService.showError('Lỗi!', 'Không thể tạo sản phẩm');
          }
        });
      }
    } catch (error) {
      this.isSaving = false;
      console.error('Error in onSubmit:', error);
      this.notificationService.showError('Lỗi!', 'Có lỗi xảy ra khi xử lý');
    }
  }

  private validateForm(): boolean {
    if (!this.productForm.name.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập tên sản phẩm');
      return false;
    }

    if (!this.productForm.description.trim()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập mô tả sản phẩm');
      return false;
    }

    if (this.productForm.price <= 0) {
      this.notificationService.showError('Lỗi!', 'Vui lòng nhập giá sản phẩm hợp lệ');
      return false;
    }

    // Image is optional - can be uploaded file or URL
    if (!this.productForm.imageUrl.trim() && !this.selectedImageFile) {
      this.notificationService.showError('Lỗi!', 'Vui lòng chọn ảnh hoặc nhập URL ảnh');
      return false;
    }

    if (!this.productForm.categoryId) {
      this.notificationService.showError('Lỗi!', 'Vui lòng chọn danh mục');
      return false;
    }

    if (this.productForm.stock < 0) {
      this.notificationService.showError('Lỗi!', 'Số lượng tồn kho không được âm');
      return false;
    }

    return true;
  }

  onCancel(): void {
    this.router.navigate(['/admin/products']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  previewImage(): string {
    return this.productForm.imageUrl || 'assets/images/placeholder-product.jpg';
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Chưa chọn';
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.notificationService.showError('Lỗi', 'Vui lòng chọn file ảnh hợp lệ');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.showError('Lỗi', 'Kích thước file không được vượt quá 5MB');
        return;
      }

      this.selectedImageFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImageFile = null;
    this.selectedImagePreview = null;
    
    // Reset file input
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async uploadImage(): Promise<string | null> {
    if (!this.selectedImageFile) {
      return null;
    }

    try {
      // Create a compressed base64 data URL with reduced quality
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          // Resize image to max 400x400 to reduce file size
          const maxSize = 400;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress image
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with reduced quality (0.7)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          // If still too long, use a tiny placeholder (under 255 chars)
          if (compressedDataUrl.length > 200) {
            console.warn('Image too large, using tiny placeholder');
            resolve('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJyZWQiLz48L3N2Zz4=');
          } else {
            resolve(compressedDataUrl);
          }
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        // Create object URL and load image
        const objectUrl = URL.createObjectURL(this.selectedImageFile!);
        img.src = objectUrl;
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      this.notificationService.showError('Lỗi', 'Không thể upload ảnh');
      return null;
    }
  }
}
