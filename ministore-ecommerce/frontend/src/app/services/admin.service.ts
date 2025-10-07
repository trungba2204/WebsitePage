import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminAuthService } from './admin-auth.service';
import { 
  AdminUser, 
  AdminDashboardStats, 
  CreateProductRequest, 
  UpdateProductRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateBlogRequest,
  UpdateBlogRequest
} from '../models/admin.model';
import { User } from '../models/user.model';
import { Product, ProductResponse, Category } from '../models/product.model';
import { Blog } from '../models/blog.model';
import { BlogResponse } from '../services/blog.service';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = `${environment.apiUrl}/admin`;
  private http = inject(HttpClient);
  private adminAuthService = inject(AdminAuthService);

  // Dashboard
  getDashboardStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.API_URL}/dashboard/stats`);
  }

  // Products Management
  getProducts(page: number = 0, size: number = 10, sort?: string, search?: string): Observable<ProductResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (sort) params = params.set('sort', sort);
    if (search) params = params.set('search', search);

    return this.http.get<ProductResponse>(`${this.API_URL}/products`, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/products/${id}`);
  }

  createProduct(product: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(`${this.API_URL}/products`, product);
  }

  updateProduct(product: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.API_URL}/products/${product.id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/products/${id}`);
  }

  // Categories Management
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.API_URL}/categories`);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.API_URL}/categories/${id}`);
  }

  createCategory(category: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${this.API_URL}/categories`, category);
  }

  updateCategory(category: UpdateCategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.API_URL}/categories/${category.id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/categories/${id}`);
  }

  // Blogs Management
  getBlogs(page: number = 0, size: number = 10, sort?: string, search?: string): Observable<BlogResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (sort) params = params.set('sort', sort);
    if (search) params = params.set('search', search);

    return this.http.get<BlogResponse>(`${this.API_URL}/blogs`, { params });
  }

  getBlogById(id: number): Observable<Blog> {
    return this.http.get<Blog>(`${this.API_URL}/blogs/${id}`);
  }

  createBlog(blog: CreateBlogRequest): Observable<Blog> {
    return this.http.post<Blog>(`${this.API_URL}/blogs`, blog);
  }

  updateBlog(blog: UpdateBlogRequest): Observable<Blog> {
    return this.http.put<Blog>(`${this.API_URL}/blogs/${blog.id}`, blog);
  }

  deleteBlog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/blogs/${id}`);
  }

  // Users Management
  getUsers(page: number = 0, size: number = 10, sort?: string, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (sort) params = params.set('sort', sort);
    if (search) params = params.set('search', search);

    return this.http.get<any>(`${this.API_URL}/users`, { params });
  }

  getUserById(id: number): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.API_URL}/users/${id}`);
  }

  createUser(user: Partial<AdminUser> & { password: string }): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.API_URL}/users`, user);
  }

  updateUser(user: Partial<AdminUser>): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.API_URL}/users/${user.id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/${id}`);
  }

  // Orders Management
  getOrders(page: number = 0, size: number = 10, sort?: string, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (sort) params = params.set('sort', sort);
    if (search) params = params.set('search', search);

    return this.http.get<any>(`${this.API_URL}/orders`, { params });
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.API_URL}/orders/${id}`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.API_URL}/orders/${orderId}/status`, { status });
  }

  // File Upload
  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = this.adminAuthService.getToken();
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    console.log('🔍 AdminService uploadImage - Token exists:', !!token);
    console.log('🔍 AdminService uploadImage - Headers:', headers.keys());
    
    return this.http.post<{ url: string }>(`${this.API_URL}/upload/image`, formData, {
      headers: headers
    });
  }

  // Team Management
  getTeamMembers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/team`);
  }

  createTeamMember(member: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/team`, member);
  }

  updateTeamMember(id: number, member: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/team/${id}`, member);
  }

  deleteTeamMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/team/${id}`);
  }

  // User Avatar Management
  updateUserAvatar(avatarUrl: string): Observable<User> {
    const token = this.adminAuthService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    console.log('🔍 AdminService updateUserAvatar - Updating avatar to:', avatarUrl);
    console.log('🔍 AdminService updateUserAvatar - Token exists:', !!token);
    
    return this.http.put<User>(`${environment.apiUrl}/user/avatar`, { avatar: avatarUrl }, {
      headers: headers
    });
  }

  // Analytics
  getAnalyticsData(period: string = '7d'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get<any>(`${this.API_URL}/analytics`, { params });
  }
}
