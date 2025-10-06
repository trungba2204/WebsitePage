import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DiscountCodeService } from '../../services/discount-code.service';
import { DiscountCode } from '../../models/discount-code.model';

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './promotions.component.html',
  styleUrl: './promotions.component.scss'
})
export class PromotionsComponent implements OnInit {
  discountCodeService = inject(DiscountCodeService);

  discountCodes: DiscountCode[] = [];
  isLoading = false;
  selectedCategory = 'all';

  categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'PERCENTAGE', label: 'Giảm phần trăm' },
    { value: 'FIXED', label: 'Giảm số tiền' }
  ];

  ngOnInit(): void {
    this.loadDiscountCodes();
  }

  loadDiscountCodes(): void {
    this.isLoading = true;
    this.discountCodeService.getAllDiscountCodes().subscribe({
      next: (codes) => {
        // Filter only active and not expired codes
        this.discountCodes = codes.filter(code => 
          code.isActive && 
          new Date(code.endDate) > new Date()
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading discount codes:', error);
        this.isLoading = false;
      }
    });
  }

  getFilteredDiscountCodes(): DiscountCode[] {
    if (this.selectedCategory === 'all') {
      return this.discountCodes;
    }
    return this.discountCodes.filter(code => code.discountType === this.selectedCategory);
  }

  getStatusText(code: DiscountCode): string {
    const now = new Date();
    const endDate = new Date(code.endDate);

    if (now > endDate) {
      return 'Đã hết hạn';
    }
    if (code.usageLimit && code.usedCount >= code.usageLimit) {
      return 'Đã hết lượt';
    }
    return 'Còn hiệu lực';
  }

  getStatusClass(code: DiscountCode): string {
    const status = this.getStatusText(code);
    switch (status) {
      case 'Còn hiệu lực': return 'badge bg-success';
      case 'Đã hết lượt': return 'badge bg-warning';
      case 'Đã hết hạn': return 'badge bg-secondary';
      default: return 'badge bg-secondary';
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getDaysRemaining(dateString: string): number {
    const now = new Date();
    const endDate = new Date(dateString);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  copyToClipboard(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      // Show success message (you can implement a toast notification here)
      console.log('Code copied to clipboard:', code);
    });
  }

  getProgressWidth(endDate: string): number {
    const days = this.getDaysRemaining(endDate);
    const progress = (days / 30) * 100;
    return Math.max(10, progress);
  }
}
