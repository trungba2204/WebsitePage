import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Favorite, AddToFavoritesRequest, RemoveFromFavoritesRequest } from '../models/favorite.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private readonly API_URL = `${environment.apiUrl}/favorites`;
  private http = inject(HttpClient);

  getUserFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(this.API_URL);
  }

  addToFavorites(request: AddToFavoritesRequest): Observable<Favorite> {
    return this.http.post<Favorite>(this.API_URL, request);
  }

  removeFromFavorites(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${productId}`);
  }

  isFavorite(productId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/check/${productId}`);
  }
}
