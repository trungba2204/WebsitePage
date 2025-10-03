import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '../models/cart.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly API_URL = `${environment.apiUrl}/cart`;
  
  cart = signal<Cart | null>(null);
  cartItemCount = signal<number>(0);

  constructor(private http: HttpClient) {
    this.loadCart();
  }

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.API_URL).pipe(
      tap(cart => this.updateCartState(cart))
    );
  }

  addToCart(request: AddToCartRequest): Observable<Cart> {
    return this.http.post<Cart>(`${this.API_URL}/items`, request).pipe(
      tap(cart => this.updateCartState(cart))
    );
  }

  updateCartItem(itemId: number, request: UpdateCartItemRequest): Observable<Cart> {
    return this.http.put<Cart>(`${this.API_URL}/items/${itemId}`, request).pipe(
      tap(cart => this.updateCartState(cart))
    );
  }

  removeCartItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.API_URL}/items/${itemId}`).pipe(
      tap(cart => this.updateCartState(cart))
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.API_URL).pipe(
      tap(() => {
        this.cart.set(null);
        this.cartItemCount.set(0);
      })
    );
  }

  private loadCart(): void {
    this.getCart().subscribe({
      error: (error) => console.error('Error loading cart:', error)
    });
  }

  private updateCartState(cart: Cart): void {
    this.cart.set(cart);
    this.cartItemCount.set(cart.totalItems);
  }
}

