import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
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
export class HeaderComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);
  productService = inject(ProductService);
  router = inject(Router);
  
  isMenuOpen = false;
  isUserMenuOpen = false;
  searchQuery = '';
  searchResults: Product[] = [];
  showSearchResults = false;
  isSearching = false;
  
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

