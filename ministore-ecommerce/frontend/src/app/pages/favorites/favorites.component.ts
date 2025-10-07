import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoriteService } from '../../services/favorite.service';
import { Favorite } from '../../models/favorite.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent implements OnInit {
  favoriteService = inject(FavoriteService);
  
  favorites: Favorite[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading = true;
    
    this.favoriteService.getUserFavorites().subscribe({
      next: (favorites) => {
        this.favorites = favorites;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
        this.isLoading = false;
      }
    });
  }

  removeFromFavorites(productId: number): void {
    this.favoriteService.removeFromFavorites(productId).subscribe({
      next: () => {
        // Remove from local array
        this.favorites = this.favorites.filter(fav => fav.productId !== productId);
      },
      error: (error) => {
        console.error('Error removing from favorites:', error);
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
}
