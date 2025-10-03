import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  
  cartService = inject(CartService);
  notificationService = inject(NotificationService);
  isAddingToCart = false;

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.isAddingToCart = true;
    this.cartService.addToCart({
      productId: this.product.id,
      quantity: 1
    }).subscribe({
      next: () => {
        this.isAddingToCart = false;
        this.notificationService.showSuccess(
          'Thành công!',
          `${this.product.name} đã được thêm vào giỏ hàng`
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
}

