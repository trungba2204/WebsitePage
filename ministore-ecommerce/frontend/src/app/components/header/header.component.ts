import { Component, inject, HostListener, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { AdminService } from '../../services/admin.service';
import { NotificationService } from '../../services/notification.service';
import { Product } from '../../models/product.model';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  cartService = inject(CartService);
  productService = inject(ProductService);
  adminService = inject(AdminService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  
  isMenuOpen = false;
  isUserMenuOpen = false;
  searchQuery = '';
  searchResults: Product[] = [];
  showSearchResults = false;
  isSearching = false;

  // Avatar upload
  isUploadingAvatar = false;
  showAvatarModal = false;
  
  // Avatar URL signal
  private avatarTimestamp = signal(Date.now());
  avatarUrl = computed(() => {
    const avatar = this.authService.currentUser()?.avatar;
    if (!avatar) {
      return 'https://via.placeholder.com/40';
    }
    const separator = avatar.includes('?') ? '&' : '?';
    return `${avatar}${separator}t=${this.avatarTimestamp()}`;
  });
  
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    // Debounce search input
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          if (query.trim().length < 2) {
            this.searchResults = [];
            return of([]);
          }
          this.isSearching = true;
          return this.productService.searchProducts(query);
        })
      )
      .subscribe({
        next: (results) => {
          this.searchResults = results.slice(0, 5); // Limit to 5 results
          this.isSearching = false;
          this.showSearchResults = this.searchQuery.trim().length >= 2;
        },
        error: (error) => {
          console.error('Search error:', error);
          this.isSearching = false;
        }
      });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { 
        queryParams: { search: this.searchQuery.trim() } 
      });
      this.closeSearchResults();
    }
  }

  closeSearchResults(): void {
    this.showSearchResults = false;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  onUserMenuBlur(): void {
    // Delay closing to allow clicks on dropdown items
    setTimeout(() => {
      if (!document.activeElement?.closest('.user-menu')) {
        this.isUserMenuOpen = false;
      }
    }, 150);
  }

  logout(): void {
    this.authService.logout();
  }

  // Avatar upload methods
  openAvatarModal(): void {
    this.showAvatarModal = true;
    this.closeUserMenu();
  }

  closeAvatarModal(): void {
    this.showAvatarModal = false;
  }

  onAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.notificationService.showError('Lỗi!', 'Vui lòng chọn file ảnh hợp lệ');
        return;
      }
      
      // Check for HEIC format (not supported by web browsers)
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
        this.notificationService.showError('Lỗi!', 'Định dạng HEIC không được hỗ trợ trên web. Vui lòng chọn file JPG, PNG, GIF hoặc WEBP.');
        return;
      }
      
      // Check for web-compatible formats
      const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!supportedTypes.includes(file.type)) {
        this.notificationService.showError('Lỗi!', 'Chỉ hỗ trợ định dạng JPG, PNG, GIF và WEBP. Vui lòng chọn file khác.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.showError('Lỗi!', 'Kích thước file không được vượt quá 5MB');
        return;
      }
      
      this.uploadAvatar(file);
    }
  }

  uploadAvatar(file: File): void {
    this.isUploadingAvatar = true;
    console.log('🔍 HeaderComponent uploadAvatar - Starting user avatar upload:', file.name);

    this.adminService.uploadImage(file).subscribe({
      next: (response: any) => {
        console.log('✅ HeaderComponent uploadAvatar - Image upload success:', response.url);
        
        // Update user avatar in database via AuthService
        this.authService.uploadAvatar(file).subscribe({
          next: (updatedUser: any) => {
            console.log('✅ HeaderComponent uploadAvatar - Avatar updated in database:', updatedUser);
            
            this.isUploadingAvatar = false;
            this.closeAvatarModal();
            
            // Update timestamp to force new URL generation
            this.avatarTimestamp.set(Date.now());
            
            this.notificationService.showSuccess(
              'Thành công!',
              'Ảnh đại diện đã được cập nhật thành công'
            );
          },
          error: (dbError: any) => {
            this.isUploadingAvatar = false;
            console.error('❌ HeaderComponent uploadAvatar - Database update error:', dbError);
            this.notificationService.showError('Lỗi!', 'Không thể lưu ảnh đại diện vào database. Vui lòng thử lại.');
          }
        });
      },
      error: (uploadError) => {
        this.isUploadingAvatar = false;
        console.error('❌ HeaderComponent uploadAvatar - Image upload error:', uploadError);
        this.notificationService.showError('Lỗi!', 'Không thể tải lên ảnh đại diện. Vui lòng thử lại.');
      }
    });
  }


  // Handle image loading success
  onImageLoad(event: any): void {
    // Show avatar image and hide icon
    event.target.style.display = 'block';
    const iconElement = event.target.nextElementSibling;
    if (iconElement) {
      iconElement.style.display = 'none';
    }
  }

  // Handle image loading errors
  onImageError(event: any): void {
    // Hide avatar image and show icon
    event.target.style.display = 'none';
    const iconElement = event.target.nextElementSibling;
    if (iconElement) {
      iconElement.style.display = 'block';
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Close search results if clicking outside search bar
    if (!target.closest('.search-bar')) {
      this.closeSearchResults();
    }
    
    // Close user menu if clicking outside user menu
    if (!target.closest('.user-menu')) {
      this.isUserMenuOpen = false;
    }
  }
}

