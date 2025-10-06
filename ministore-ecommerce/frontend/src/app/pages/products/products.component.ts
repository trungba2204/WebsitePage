import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { Product, Category, ProductFilter, ProductResponse } from '../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  productService = inject(ProductService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  
  products: Product[] = [];
  categories: Category[] = [];
  categoryCounts: {[key: number]: number} = {};
  isLoading = true;
  
  filter: ProductFilter = {
    page: 0,
    size: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };
  
  totalPages = 0;
  totalElements = 0;
  totalProductsInDatabase = 0; // Store actual total products in database
  currentPage = 0;
  showFilters = false;
  
  // Advanced filter options
  priceRange = { min: 0, max: 10000000 };
  selectedRating = 0;
  inStockOnly = false;

  ngOnInit(): void {
    this.loadCategories();
    
    this.route.queryParams.subscribe(params => {
      // Reset category filter
      if (params['category']) {
        this.filter.categoryId = +params['category'];
      } else {
        delete this.filter.categoryId;
      }
      
      // Reset search filter
      if (params['search']) {
        this.filter.search = params['search'];
      } else {
        delete this.filter.search;
      }
      
      this.loadProducts();
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadCategoryCounts();
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  loadCategoryCounts(): void {
    this.productService.getProductCountsByCategory().subscribe({
      next: (counts) => {
        this.categoryCounts = counts;
        // Calculate total products in database from category counts
        this.totalProductsInDatabase = Object.values(counts).reduce((sum, count) => sum + count, 0);
      },
      error: (error) => console.error('Error loading category counts:', error)
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    
    this.productService.getProducts(this.filter).subscribe({
      next: (response: ProductResponse) => {
        this.products = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.currentPage = response.number;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });
  }

  onCategoryChange(categoryId?: number): void {
    if (categoryId) {
      this.filter.categoryId = categoryId;
    } else {
      delete this.filter.categoryId; // Remove the property completely
    }
    this.filter.page = 0;
    this.updateQueryParams();
  }

  onSortChange(): void {
    this.filter.page = 0;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.filter.page = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateQueryParams(): void {
    const queryParams: any = {};
    if (this.filter.categoryId) {
      queryParams.category = this.filter.categoryId;
    } else {
      queryParams.category = null; // Explicitly remove category param
    }
    if (this.filter.search) {
      queryParams.search = this.filter.search;
    } else {
      queryParams.search = null; // Explicitly remove search param
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onPriceRangeChange(): void {
    this.filter.minPrice = this.priceRange.min;
    this.filter.maxPrice = this.priceRange.max;
    this.filter.page = 0;
    this.loadProducts();
  }

  onRatingChange(rating: number): void {
    this.selectedRating = rating;
    this.filter.minRating = rating > 0 ? rating : undefined;
    this.filter.page = 0;
    this.loadProducts();
  }

  onStockFilterChange(): void {
    this.filter.inStockOnly = this.inStockOnly;
    this.filter.page = 0;
    this.loadProducts();
  }

  clearFilters(): void {
    this.filter = {
      page: 0,
      size: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    this.priceRange = { min: 0, max: 10000000 };
    this.selectedRating = 0;
    this.inStockOnly = false;
    this.updateQueryParams();
    this.loadProducts();
  }

  getProductCount(): number {
    return this.products.length;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.filter.categoryId) count++;
    if (this.filter.minPrice || this.filter.maxPrice) count++;
    if (this.filter.minRating) count++;
    if (this.filter.inStockOnly) count++;
    if (this.filter.search) count++;
    return count;
  }

  getTotalProducts(): number {
    return this.totalProductsInDatabase;
  }

  getCategoryProductCount(categoryId: number): number {
    return this.categoryCounts[categoryId] || 0;
  }
}

