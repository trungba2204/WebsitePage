import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Product, ProductFilter, ProductResponse, Category } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = `${environment.apiUrl}/products`;
  private readonly CATEGORY_URL = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getProducts(filter?: ProductFilter): Observable<ProductResponse> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.categoryId) params = params.set('categoryId', filter.categoryId.toString());
      if (filter.minPrice) params = params.set('minPrice', filter.minPrice.toString());
      if (filter.maxPrice) params = params.set('maxPrice', filter.maxPrice.toString());
      if (filter.minRating) params = params.set('minRating', filter.minRating.toString());
      if (filter.inStockOnly) params = params.set('inStockOnly', filter.inStockOnly.toString());
      if (filter.search) params = params.set('search', filter.search);
      if (filter.page !== undefined) params = params.set('page', filter.page.toString());
      if (filter.size) params = params.set('size', filter.size.toString());
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
    }

    return this.http.get<ProductResponse>(this.API_URL, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.CATEGORY_URL);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.CATEGORY_URL}/${id}`);
  }

  getFeaturedProducts(limit: number = 8): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/featured`, {
      params: { limit: limit.toString() }
    });
  }

  getNewArrivals(limit: number = 8): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/new-arrivals`, {
      params: { limit: limit.toString() }
    });
  }

  searchProducts(query: string): Observable<Product[]> {
    const params = new HttpParams()
      .set('search', query)
      .set('size', '10'); // Limit results for search dropdown
    
    return this.http.get<ProductResponse>(this.API_URL, { params })
      .pipe(
        switchMap(response => of(response.content))
      );
  }

  getProductCountByCategory(categoryId: number): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/counts/category/${categoryId}`);
  }

  getProductCountsByCategory(): Observable<{[key: number]: number}> {
    return this.http.get<{[key: number]: number}>(`${this.API_URL}/counts/categories`);
  }
}

