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
    this.loadBlogs();
    this.loadCategories();
    this.loadRecentBlogs();
    this.loadPopularBlogs();
  }

  loadBlogs(): void {
    this.isLoading = true;
    
    this.blogService.getBlogs(this.filter).subscribe({
      next: (response) => {
        this.blogs = response.content;
        this.totalPages = response.totalPages;
        this.currentPage = response.number;
        this.totalBlogs = response.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading blogs:', error);
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.blogService.getBlogCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => console.error('Error loading categories:', error)
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

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.filter.category = category;
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
    // This would need to be implemented based on your API
    // For now, return a mock number
    return Math.floor(Math.random() * 10) + 1;
  }
}
