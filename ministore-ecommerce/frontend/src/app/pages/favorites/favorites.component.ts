import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoriteService } from '../../services/favorite.service';
import { Favorite } from '../../models/favorite.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent implements OnInit {
  favoriteService = inject(FavoriteService);
  notificationService = inject(NotificationService);
  
  favorites: Favorite[] = [];
  isLoading = false;
  removingIds: Set<number> = new Set();

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    console.log('🔄 Loading user favorites...');
    this.isLoading = true;
    
    this.favoriteService.getUserFavorites().subscribe({
      next: (favorites) => {
        console.log('✅ Favorites loaded successfully:', favorites);
        console.log('🔍 Favorites structure check:', favorites.map(fav => ({
          id: fav.id,
          productId: fav.productId,
          userId: fav.userId,
          product: fav.product ? { id: fav.product.id, name: fav.product.name } : 'NO PRODUCT'
        })));
        this.favorites = favorites;
        this.isLoading = false;
        console.log('📋 Total favorites:', this.favorites.length);
      },
      error: (error) => {
        console.error('❌ Error loading favorites:', error);
        console.error('❌ Error details:', error.status, error.message);
        this.isLoading = false;
        
        // Show user-friendly error message
        this.notificationService.showError('Lỗi', 'Có lỗi xảy ra khi tải danh sách yêu thích. Vui lòng thử lại.');
      }
    });
  }

  removeFromFavorites(productId: number): void {
    console.log('🔄 Removing product from favorites:', productId);
    console.log('🔍 ProductId type:', typeof productId, 'Value:', productId);
    
    // Validate productId
    if (!productId || productId === undefined || productId === null) {
      console.error('❌ Invalid productId:', productId);
      this.notificationService.showError('Lỗi', 'ID sản phẩm không hợp lệ!');
      return;
    }
    
    // Add to removing set to show loading state
    this.removingIds.add(productId);
    
    this.favoriteService.removeFromFavorites(productId).subscribe({
      next: () => {
        console.log('✅ Successfully removed from favorites:', productId);
        // Remove from local array
        this.favorites = this.favorites.filter(fav => fav.productId !== productId);
        console.log('📋 Updated favorites list:', this.favorites.length, 'items');
        
        // Remove from removing set
        this.removingIds.delete(productId);
        
        // Show success notification
        this.notificationService.showSuccess('Thành công', 'Đã bỏ yêu thích sản phẩm thành công!');
      },
      error: (error) => {
        console.error('❌ Error removing from favorites:', error);
        console.error('❌ Error details:', error.status, error.message);
        
        // Remove from removing set
        this.removingIds.delete(productId);
        
        // Show user-friendly error message
        this.notificationService.showError('Lỗi', 'Có lỗi xảy ra khi bỏ yêu thích. Vui lòng thử lại.');
      }
    });
  }

  getFavoriteProducts() {
    return this.favorites.map(fav => fav.product);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  isRemoving(productId: number): boolean {
    return this.removingIds.has(productId);
  }
}
