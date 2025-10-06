import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Blog, BlogCategory, BlogComment, CreateBlogCommentRequest } from '../models/blog.model';

export interface BlogFilter {
  category?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BlogResponse {
  content: Blog[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private readonly API_URL = `${environment.apiUrl}/blogs`;
  private http = inject(HttpClient);

  getBlogs(filter?: BlogFilter): Observable<BlogResponse> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.category) params = params.set('category', filter.category);
      if (filter.search) params = params.set('search', filter.search);
      if (filter.page !== undefined) params = params.set('page', filter.page.toString());
      if (filter.size) params = params.set('size', filter.size.toString());
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
    }

    return this.http.get<BlogResponse>(this.API_URL, { params });
  }

  getBlogBySlug(slug: string): Observable<Blog> {
    return this.http.get<Blog>(`${this.API_URL}/slug/${slug}`);
  }

  getBlogById(id: number): Observable<Blog> {
    return this.http.get<Blog>(`${this.API_URL}/${id}`);
  }

  getBlogCategories(): Observable<BlogCategory[]> {
    return this.http.get<BlogCategory[]>(`${this.API_URL}/categories`);
  }

  getCategoryCounts(): Observable<{category: string, count: number}[]> {
    return this.http.get<{category: string, count: number}[]>(`${this.API_URL}/categories/count`);
  }

  getRecentBlogs(limit: number = 5): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.API_URL}/recent`, {
      params: { limit: limit.toString() }
    });
  }

  getPopularBlogs(limit: number = 5): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.API_URL}/popular`, {
      params: { limit: limit.toString() }
    });
  }

  getBlogComments(blogId: number): Observable<BlogComment[]> {
    return this.http.get<BlogComment[]>(`${this.API_URL}/${blogId}/comments`);
  }

  createComment(request: CreateBlogCommentRequest): Observable<BlogComment> {
    return this.http.post<BlogComment>(`${this.API_URL}/${request.blogId}/comments`, request);
  }

  likeBlog(blogId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/${blogId}/like`, {});
  }
}
