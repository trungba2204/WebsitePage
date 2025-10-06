import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminService } from '../../services/admin.service';
import { NotificationService } from '../../services/notification.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  adminAuthService = inject(AdminAuthService);
  adminService = inject(AdminService);
  notificationService = inject(NotificationService);
  router = inject(Router);

  isSidebarCollapsed = false;
  currentRoute = '';
  currentUser = this.adminAuthService.adminUser;

  // Avatar upload
  isUploadingAvatar = false;
  showAvatarModal = false;
  isUserMenuOpen = false;
  
  // Avatar URL signal
  private avatarTimestamp = signal(Date.now());
  avatarUrl = computed(() => {
    const avatar = this.currentUser()?.avatar;
    if (!avatar) {
      // Use data URI instead of external placeholder
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNmOGY5ZmEiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMCIgeT0iMTAiPgo8cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTQgMC0yLjIxLTEuNzktNC00LTQtMi4yMSAwLTQgMS43OS00IDQgMCAyLjIxIDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiIGZpbGw9IiM2Yzc1N2QiLz4KPC9zdmc+Cjwvc3ZnPgo=';
    }
    const separator = avatar.includes('?') ? '&' : '?';
    return `${avatar}${separator}t=${this.avatarTimestamp()}`;
  });

  // Sidebar menu items
  menuItems = [
    {
      label: 'Dashboard',
      icon: 'bi-speedometer2',
      route: '/admin/dashboard',
      active: false
    },
    {
      label: 'Sản phẩm',
      icon: 'bi-box-seam',
      route: '/admin/products',
      active: false
    },
    {
      label: 'Danh mục',
      icon: 'bi-tags',
      route: '/admin/categories',
      active: false
    },
    {
      label: 'Blog',
      icon: 'bi-journal-text',
      route: '/admin/blogs',
      active: false
    },
    {
      label: 'Đơn hàng',
      icon: 'bi-cart-check',
      route: '/admin/orders',
      active: false
    },
    {
      label: 'Người dùng',
      icon: 'bi-people',
      route: '/admin/users',
      active: false
    },
    {
      label: 'Mã giảm giá',
      icon: 'bi-ticket-perforated',
      route: '/admin/discount-codes',
      active: false
    },
    {
      label: 'Đội ngũ',
      icon: 'bi-people-fill',
      route: '/admin/team',
      active: false
    }
  ];

  ngOnInit(): void {
    // Track route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentRoute = (event as NavigationEnd).url;
        this.updateActiveMenuItem();
      });

    // Set initial active menu item
    this.updateActiveMenuItem();

    // Refresh admin user data from database to ensure avatar is loaded
    this.refreshAdminUser();

    // Debug admin user data
    console.log('🔍 AdminLayoutComponent ngOnInit - Admin user:', this.currentUser());
    console.log('🔍 AdminLayoutComponent ngOnInit - Admin avatar:', this.currentUser()?.avatar);
    console.log('🔍 AdminLayoutComponent ngOnInit - Admin role:', this.currentUser()?.role);
  }

  updateActiveMenuItem(): void {
    this.menuItems.forEach(item => {
      item.active = this.currentRoute === item.route || 
                   (item.route !== '/admin/dashboard' && this.currentRoute.startsWith(item.route));
    });
  }

  refreshAdminUser(): void {
    console.log('🔍 AdminLayoutComponent refreshAdminUser - Refreshing admin user data');
    this.adminAuthService.refreshAdminUser().subscribe({
      next: (user) => {
        console.log('✅ AdminLayoutComponent refreshAdminUser - User data refreshed:', user);
        // Update timestamp to force avatar URL refresh
        this.avatarTimestamp.set(Date.now());
      },
      error: (error) => {
        console.error('❌ AdminLayoutComponent refreshAdminUser - Error refreshing user data:', error);
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout(): void {
    console.log('🔍 AdminLayoutComponent logout - Logout button clicked');
    this.adminAuthService.logout();
  }

  goToMainSite(): void {
    this.router.navigate(['/']);
  }

  getBreadcrumb(): string {
    const currentItem = this.menuItems.find(item => item.active);
    return currentItem ? currentItem.label : 'Dashboard';
  }

  // User menu methods
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
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
    console.log('🔍 Admin avatar file selected');
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      console.log('🔍 Selected file:', file.name, file.size, file.type);
      
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
      
      console.log('🔍 File validation passed, starting upload');
      this.uploadAvatar(file);
    }
  }

  uploadAvatar(file: File): void {
    console.log('🔍 Starting admin avatar upload for file:', file.name);
    this.isUploadingAvatar = true;

    // Check admin authentication
    const adminToken = this.adminAuthService.getToken();
    const adminUser = this.adminAuthService.adminUser();
    console.log('🔍 Admin token exists:', !!adminToken);
    console.log('🔍 Admin user:', adminUser);
    console.log('🔍 Admin user role:', adminUser?.role);

    // Use AdminAuthService.uploadAvatar to save to database
    this.adminAuthService.uploadAvatar(file).subscribe({
      next: (updatedUser) => {
        console.log('✅ Admin avatar uploaded and saved to database:', updatedUser);
        
        this.isUploadingAvatar = false;
        this.closeAvatarModal();
        
        // Update timestamp to force new URL generation
        this.avatarTimestamp.set(Date.now());
        
        this.notificationService.showSuccess(
          'Thành công!',
          'Ảnh đại diện admin đã được cập nhật thành công'
        );
      },
      error: (error) => {
        this.isUploadingAvatar = false;
        console.error('❌ Admin avatar upload error:', error);
        console.error('❌ Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        this.notificationService.showError('Lỗi!', 'Không thể tải lên ảnh đại diện. Vui lòng thử lại.');
      }
    });
  }


  // Handle image loading errors
  onImageError(event: any): void {
    // Set fallback image using data URI
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNmOGY5ZmEiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMCIgeT0iMTAiPgo8cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTQgMC0yLjIxLTEuNzktNC00LTQtMi4yMSAwLTQgMS43OS00IDQgMCAyLjIxIDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiIGZpbGw9IiM2Yzc1N2QiLz4KPC9zdmc+Cjwvc3ZnPgo=';
  }

  // Helper methods for admin display
  getAdminDisplayName(): string {
    const admin = this.currentUser();
    if (!admin) return 'Admin';
    
    // If admin has firstName and lastName, use them
    if (admin.firstName && admin.lastName) {
      return `${admin.firstName} ${admin.lastName}`;
    }
    
    // If only firstName, use it
    if (admin.firstName) {
      return admin.firstName;
    }
    
    // Fallback to email username part
    if (admin.email) {
      return admin.email.split('@')[0];
    }
    
    return 'Admin';
  }

  getAdminRole(): string {
    const admin = this.currentUser();
    return admin?.role === 'ADMIN' ? 'Administrator' : admin?.role || 'Admin';
  }
}