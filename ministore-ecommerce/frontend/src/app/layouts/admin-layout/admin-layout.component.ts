import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  isSidebarCollapsed = false;
  currentRoute = '';
  currentUser = this.authService.currentUser;

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
  }

  updateActiveMenuItem(): void {
    this.menuItems.forEach(item => {
      item.active = this.currentRoute === item.route || 
                   (item.route !== '/admin/dashboard' && this.currentRoute.startsWith(item.route));
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

  goToMainSite(): void {
    this.router.navigate(['/']);
  }

  getBreadcrumb(): string {
    const currentItem = this.menuItems.find(item => item.active);
    return currentItem ? currentItem.label : 'Dashboard';
  }
}