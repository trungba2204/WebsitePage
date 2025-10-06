import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService, BlogFilter } from '../../services/blog.service';
import { Blog, BlogCategory } from '../../models/blog.model';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.scss'
})
export class BlogsComponent implements OnInit {
  blogService = inject(BlogService);
  
  blogs: Blog[] = [];
  categories: BlogCategory[] = [];
  categoryCounts: {category: string, count: number}[] = [];
  recentBlogs: Blog[] = [];
  popularBlogs: Blog[] = [];
  totalBlogs = 0;
  
  isLoading = true;
  currentPage = 0;
  totalPages = 0;
  pageSize = 6;
  
  filter: BlogFilter = {
    page: 0,
    size: 6,
    sortBy: 'publishDate',
    sortOrder: 'desc'
  };
  
  searchQuery = '';
  selectedCategory = '';

  ngOnInit(): void {
    console.log('🔍 BlogsComponent ngOnInit - Starting initialization');
    this.loadBlogs();
    this.loadCategories();
    this.loadCategoryCounts();
    this.loadRecentBlogs();
    this.loadPopularBlogs();
  }

  loadBlogs(): void {
    console.log('🔍 BlogsComponent loadBlogs - Loading blogs with filter:', this.filter);
    console.log('🔍 BlogsComponent loadBlogs - Filter category value:', this.filter.category);
    this.isLoading = true;
    
    this.blogService.getBlogs(this.filter).subscribe({
      next: (response) => {
        this.blogs = response.content;
        this.totalPages = response.totalPages;
        this.currentPage = response.number;
        this.totalBlogs = response.totalElements;
        this.isLoading = false;
        console.log('✅ BlogsComponent loadBlogs - Blogs loaded:', this.blogs.length, 'blogs');
        console.log('✅ BlogsComponent loadBlogs - First blog category:', this.blogs[0]?.category);
      },
      error: (error) => {
        console.error('Error loading blogs:', error);
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    console.log('🔍 BlogsComponent loadCategories - Starting to load categories');
    this.blogService.getBlogCategories().subscribe({
      next: (categories) => {
        console.log('✅ BlogsComponent loadCategories - Categories loaded:', categories);
        this.categories = categories;
      },
      error: (error) => {
        console.error('❌ BlogsComponent loadCategories - Error loading categories:', error);
      }
    });
  }

  loadCategoryCounts(): void {
    this.blogService.getCategoryCounts().subscribe({
      next: (counts) => {
        console.log('✅ BlogsComponent - Category counts loaded:', counts);
        this.categoryCounts = counts;
      },
      error: (error) => {
        console.error('❌ BlogsComponent - Error loading category counts:', error);
        this.categoryCounts = [];
      }
    });
  }

  loadRecentBlogs(): void {
    this.blogService.getRecentBlogs(5).subscribe({
      next: (blogs) => {
        this.recentBlogs = blogs;
      },
      error: (error) => console.error('Error loading recent blogs:', error)
    });
  }

  loadPopularBlogs(): void {
    this.blogService.getPopularBlogs(5).subscribe({
      next: (blogs) => {
        this.popularBlogs = blogs;
      },
      error: (error) => console.error('Error loading popular blogs:', error)
    });
  }

  onCategoryChange(categorySlug: string): void {
    console.log('🔍 BlogsComponent onCategoryChange - Category slug:', categorySlug);
    
    // Find the category name from the slug
    const category = this.categories.find(cat => cat.slug === categorySlug);
    if (!category) {
      console.log('❌ BlogsComponent onCategoryChange - Category not found for slug:', categorySlug);
      return;
    }
    
    console.log('✅ BlogsComponent onCategoryChange - Found category:', category.name, 'for slug:', categorySlug);
    
    this.selectedCategory = categorySlug;
    this.filter.category = category.name; // Use category name, not slug
    this.filter.page = 0;
    this.currentPage = 0;
    this.loadBlogs();
  }

  onSearch(): void {
    this.filter.search = this.searchQuery;
    this.filter.page = 0;
    this.currentPage = 0;
    this.loadBlogs();
  }

  clearFilters(): void {
    console.log('🔍 BlogsComponent clearFilters - Clearing all filters');
    this.searchQuery = '';
    this.selectedCategory = '';
    this.filter = {
      page: 0,
      size: this.pageSize,
      sortBy: 'publishDate',
      sortOrder: 'desc'
    };
    this.currentPage = 0;
    this.loadBlogs();
  }

  onPageChange(page: number): void {
    this.filter.page = page;
    this.currentPage = page;
    this.loadBlogs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.onPageChange(page);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(0, this.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i + 1);
    }
    
    return pages;
  }

  getCategoryCount(categorySlug: string): number {
    console.log('🔍 BlogsComponent getCategoryCount - Looking for slug:', categorySlug);
    console.log('🔍 BlogsComponent getCategoryCount - Available counts:', this.categoryCounts);
    console.log('🔍 BlogsComponent getCategoryCount - Available categories:', this.categories);
    
    // Find the category name from the slug
    const category = this.categories.find(cat => cat.slug === categorySlug);
    if (!category) {
      console.log('❌ BlogsComponent getCategoryCount - Category not found for slug:', categorySlug);
      return 0;
    }
    
    const categoryCount = this.categoryCounts.find(item => item.category === category.name);
    const count = categoryCount ? categoryCount.count : 0;
    
    console.log('✅ BlogsComponent getCategoryCount - Found count:', count, 'for category:', category.name, 'slug:', categorySlug);
    return count;
  }
}
