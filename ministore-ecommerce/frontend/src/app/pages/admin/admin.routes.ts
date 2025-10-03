import { Routes } from '@angular/router';
import { AdminGuard } from '../../guards/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('../admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('../../layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [AdminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./admin-products/admin-products.component').then(m => m.AdminProductsComponent)
      },
      {
        path: 'products/new',
        loadComponent: () => import('./admin-product-form/admin-product-form.component').then(m => m.AdminProductFormComponent)
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./admin-product-form/admin-product-form.component').then(m => m.AdminProductFormComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./admin-categories/admin-categories.component').then(m => m.AdminCategoriesComponent)
      },
      {
        path: 'categories/new',
        loadComponent: () => import('./admin-category-form/admin-category-form.component').then(m => m.AdminCategoryFormComponent)
      },
      {
        path: 'categories/:id/edit',
        loadComponent: () => import('./admin-category-form/admin-category-form.component').then(m => m.AdminCategoryFormComponent)
      },
      {
        path: 'blogs',
        loadComponent: () => import('./admin-blogs/admin-blogs.component').then(m => m.AdminBlogsComponent)
      },
      {
        path: 'blogs/new',
        loadComponent: () => import('./admin-blog-form/admin-blog-form.component').then(m => m.AdminBlogFormComponent)
      },
      {
        path: 'blogs/:id/edit',
        loadComponent: () => import('./admin-blog-form/admin-blog-form.component').then(m => m.AdminBlogFormComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./admin-orders/admin-orders.component').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./admin-order-detail/admin-order-detail.component').then(m => m.AdminOrderDetailComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./admin-users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./admin-settings/admin-settings.component').then(m => m.AdminSettingsComponent)
      }
    ]
  }
];
