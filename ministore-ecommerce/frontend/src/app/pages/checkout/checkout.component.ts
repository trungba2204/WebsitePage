import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';
import { DiscountCodeService } from '../../services/discount-code.service';
import { Cart, CartItem } from '../../models/cart.model';
import { CreateOrderRequest, OrderStatus } from '../../models/order.model';
import { DiscountCodeValidation, ApplyDiscountRequest } from '../../models/discount-code.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);
  orderService = inject(OrderService);
  notificationService = inject(NotificationService);
  discountCodeService = inject(DiscountCodeService);
  router = inject(Router);

  cart: Cart | null = null;
  isProcessing = false;

  // Form data
  shippingAddress = {
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    postalCode: ''
  };

  paymentMethod = 'cod'; // Cash on delivery
  note = '';
  
  // Discount code
  discountCode = '';
  discountValidation: DiscountCodeValidation | null = null;
  isApplyingDiscount = false;

  ngOnInit(): void {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        if (!cart || cart.items.length === 0) {
          this.router.navigate(['/cart']);
        }
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.router.navigate(['/cart']);
      }
    });
  }

  placeOrder(): void {
    if (!this.cart || !this.validateForm()) {
      return;
    }

    this.isProcessing = true;

    const orderRequest: CreateOrderRequest = {
      shippingAddress: this.shippingAddress,
      paymentMethod: this.paymentMethod,
      note: this.note,
      discountCode: this.discountValidation?.isValid ? this.discountCode : undefined,
      discountAmount: this.discountValidation?.isValid ? this.discountValidation.discountAmount : undefined
    };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (order) => {
        this.isProcessing = false;
        console.log('🔍 Order created successfully:', order);
        console.log('Discount info in created order:', {
          discountCode: order.discountCode,
          discountAmount: order.discountAmount,
          originalAmount: order.originalAmount,
          totalAmount: order.totalAmount,
          hasDiscount: !!(order.discountCode && order.discountAmount)
        });
        
        // Show success notification
        this.notificationService.showSuccess(
          'Đặt hàng thành công!',
          `Đơn hàng ${order.orderNumber} đã được tạo thành công. Chúng tôi sẽ liên hệ với bạn sớm nhất.`
        );
        
        // Clear cart after successful order
        this.cartService.clearCart().subscribe();
        
        // Navigate to orders page
        setTimeout(() => {
          this.router.navigate(['/orders']);
        }, 2000);
      },
      error: (error) => {
        this.isProcessing = false;
        console.error('Error creating order:', error);
        this.notificationService.showError(
          'Lỗi đặt hàng!',
          'Không thể tạo đơn hàng. Vui lòng thử lại sau.'
        );
      }
    });
  }

  private validateForm(): boolean {
    return !!(this.shippingAddress.fullName && 
              this.shippingAddress.phone && 
              this.shippingAddress.address && 
              this.shippingAddress.city);
  }

  getTotalAmount(): number {
    const subtotal = this.cart?.totalPrice || 0;
    const discount = this.discountValidation?.discountAmount || 0;
    return Math.max(0, subtotal - discount);
  }

  applyDiscountCode(): void {
    if (!this.discountCode.trim() || !this.cart) {
      return;
    }

    this.isApplyingDiscount = true;
    
    const request: ApplyDiscountRequest = {
      code: this.discountCode.trim(),
      orderAmount: this.cart.totalPrice
    };

    this.discountCodeService.validateDiscountCode(request).subscribe({
      next: (validation) => {
        this.isApplyingDiscount = false;
        this.discountValidation = validation;
        
        if (validation.isValid) {
          this.notificationService.showSuccess(
            'Thành công!',
            `Mã giảm giá "${this.discountCode}" đã được áp dụng. Giảm ${this.formatPrice(validation.discountAmount)}`
          );
        } else {
          this.notificationService.showError('Lỗi!', validation.message);
        }
      },
      error: (error) => {
        this.isApplyingDiscount = false;
        console.error('Error validating discount code:', error);
        this.notificationService.showError('Lỗi!', 'Không thể kiểm tra mã giảm giá. Vui lòng thử lại.');
      }
    });
  }

  removeDiscountCode(): void {
    this.discountCode = '';
    this.discountValidation = null;
    this.notificationService.showSuccess('Thành công!', 'Đã xóa mã giảm giá');
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }
}

