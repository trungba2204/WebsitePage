import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cart-page container py-4">
      <div class="row">
        <div class="col-12">
          <h1 class="mb-4">Giỏ hàng của bạn</h1>
        </div>
      </div>

      @if (cartService.cart() && cartService.cart()!.items.length > 0) {
        <div class="row">
          <!-- Cart Items -->
          <div class="col-lg-8">
            <div class="cart-items">
              @for (item of cartService.cart()!.items; track item.id) {
                <div class="cart-item card mb-3">
                  <div class="card-body">
                    <div class="row align-items-center">
                      <!-- Product Image -->
                      <div class="col-md-2">
                        <img [src]="item.product.imageUrl" 
                             [alt]="item.product.name" 
                             class="cart-item-image">
                      </div>
                      
                      <!-- Product Info -->
                      <div class="col-md-4">
                        <h5 class="cart-item-name mb-1">{{ item.product.name }}</h5>
                        <p class="cart-item-category text-muted mb-2">{{ item.product.category.name }}</p>
                        <p class="cart-item-price mb-0">
                          <strong>{{ formatPrice(item.product.price) }}</strong>
                        </p>
                      </div>
                      
                      <!-- Quantity Controls -->
                      <div class="col-md-3">
                        <div class="quantity-controls d-flex align-items-center">
                          <button class="btn btn-outline-secondary btn-sm" 
                                  (click)="updateQuantity(item.id, item.quantity - 1)"
                                  [disabled]="item.quantity <= 1">
                            <i class="bi bi-dash"></i>
                          </button>
                          <span class="quantity mx-3">{{ item.quantity }}</span>
                          <button class="btn btn-outline-secondary btn-sm" 
                                  (click)="updateQuantity(item.id, item.quantity + 1)"
                                  [disabled]="item.quantity >= item.product.stock">
                            <i class="bi bi-plus"></i>
                          </button>
                        </div>
                        <small class="text-muted d-block mt-1">
                          Còn lại: {{ item.product.stock }} sản phẩm
                        </small>
                      </div>
                      
                      <!-- Subtotal -->
                      <div class="col-md-2">
                        <p class="cart-item-subtotal mb-0">
                          <strong>{{ formatPrice(item.subtotal) }}</strong>
                        </p>
                      </div>
                      
                      <!-- Remove Button -->
                      <div class="col-md-1 text-end">
                        <button class="btn btn-outline-danger btn-sm" 
                                (click)="removeItem(item.id)"
                                title="Xóa sản phẩm">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
          
          <!-- Order Summary -->
          <div class="col-lg-4">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Tóm tắt đơn hàng</h5>
              </div>
              <div class="card-body">
                <div class="d-flex justify-content-between mb-2">
                  <span>Tạm tính ({{ cartService.cartItemCount() }} sản phẩm):</span>
                  <span>{{ formatPrice(cartService.cart()!.totalPrice) }}</span>
                </div>
                
                <div class="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <span class="text-success">Miễn phí</span>
                </div>
                
                <hr>
                
                <div class="d-flex justify-content-between mb-3">
                  <strong>Tổng cộng:</strong>
                  <strong class="text-primary">{{ formatPrice(cartService.cart()!.totalPrice) }}</strong>
                </div>
                
                <a routerLink="/checkout" class="btn btn-primary w-100 mb-2">
                  <i class="bi bi-credit-card me-2"></i>
                  Thanh toán
                </a>
                
                <a routerLink="/products" class="btn btn-outline-secondary w-100">
                  <i class="bi bi-arrow-left me-2"></i>
                  Tiếp tục mua sắm
                </a>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="empty-cart text-center py-5">
          <div class="empty-cart-icon mb-4">
            <i class="bi bi-cart-x" style="font-size: 4rem; color: #6c757d;"></i>
          </div>
          <h3 class="mb-3">Giỏ hàng trống</h3>
          <p class="text-muted mb-4">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
          <a routerLink="/products" class="btn btn-primary btn-lg">
            <i class="bi bi-shop me-2"></i>
            Tiếp tục mua sắm
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-page { 
      min-height: 400px; 
    }
    
    .empty-cart { 
      text-align: center; 
      padding: 3rem; 
    }
    
    .cart-item-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }
    
    .cart-item-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: #212529;
    }
    
    .cart-item-category {
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
    
    .cart-item-price {
      font-size: 1rem;
      color: #dc3545;
    }
    
    .cart-item-subtotal {
      font-size: 1.1rem;
      color: #dc3545;
    }
    
    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .quantity {
      font-weight: 600;
      min-width: 2rem;
      text-align: center;
    }
    
    .cart-item {
      transition: box-shadow 0.2s ease;
    }
    
    .cart-item:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    @media (max-width: 768px) {
      .cart-item-image {
        width: 60px;
        height: 60px;
      }
      
      .cart-item-name {
        font-size: 1rem;
      }
      
      .quantity-controls {
        justify-content: center;
        margin: 0.5rem 0;
      }
    }
  `]
})
export class CartComponent {
  cartService = inject(CartService);

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  updateQuantity(itemId: number, newQuantity: number): void {
    if (newQuantity < 1) return;
    
    this.cartService.updateCartItem(itemId, { quantity: newQuantity }).subscribe({
      error: (error) => {
        console.error('Error updating cart item:', error);
      }
    });
  }

  removeItem(itemId: number): void {
    this.cartService.removeCartItem(itemId).subscribe({
      error: (error) => {
        console.error('Error removing cart item:', error);
      }
    });
  }
}

