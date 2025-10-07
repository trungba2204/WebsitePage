import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { FavoriteService } from '../../services/favorite.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { ImageFallbackDirective } from '../../directives/image-fallback.directive';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ImageFallbackDirective],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  productService = inject(ProductService);
  cartService = inject(CartService);
  notificationService = inject(NotificationService);
  favoriteService = inject(FavoriteService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  
  product: Product | null = null;
  quantity = 1;
  isLoading = true;
  isAddingToCart = false;
  activeTab = 'description';
  isFavorite = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadProduct(id);
    });
  }

  loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.isLoading = false;
        
        // Check if user is authenticated and load favorite status
        if (this.authService.isAuthenticated()) {
          this.checkFavoriteStatus(id);
        }
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.isLoading = false;
      }
    });
  }

  checkFavoriteStatus(productId: number): void {
    this.favoriteService.isFavorite(productId).subscribe({
      next: (isFavorite) => {
        this.isFavorite = isFavorite;
      },
      error: (error) => {
        console.error('Error checking favorite status:', error);
      }
    });
  }

  incrementQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product) return;
    
    this.isAddingToCart = true;
    this.cartService.addToCart({
      productId: this.product.id,
      quantity: this.quantity
    }).subscribe({
      next: () => {
        this.isAddingToCart = false;
        this.notificationService.showSuccess(
          'Thành công!',
          `${this.product?.name} (${this.quantity} sản phẩm) đã được thêm vào giỏ hàng`
        );
      },
      error: (error) => {
        this.isAddingToCart = false;
        console.error('Error adding to cart:', error);
        this.notificationService.showError(
          'Lỗi!',
          'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.'
        );
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleFavorite(): void {
    if (!this.product || !this.authService.isAuthenticated()) {
      this.notificationService.showError('Lỗi!', 'Vui lòng đăng nhập để sử dụng chức năng yêu thích');
      return;
    }

    if (this.isFavorite) {
      // Remove from favorites
      this.favoriteService.removeFromFavorites(this.product.id).subscribe({
        next: () => {
          this.isFavorite = false;
          this.notificationService.showSuccess('Thành công!', 'Đã xóa khỏi danh sách yêu thích');
        },
        error: (error) => {
          console.error('Error removing from favorites:', error);
          this.notificationService.showError('Lỗi!', 'Không thể xóa khỏi danh sách yêu thích');
        }
      });
    } else {
      // Add to favorites
      this.favoriteService.addToFavorites({ productId: this.product.id }).subscribe({
        next: () => {
          this.isFavorite = true;
          this.notificationService.showSuccess('Thành công!', 'Đã thêm vào danh sách yêu thích');
        },
        error: (error) => {
          console.error('Error adding to favorites:', error);
          this.notificationService.showError('Lỗi!', 'Không thể thêm vào danh sách yêu thích');
        }
      });
    }
  }
}

