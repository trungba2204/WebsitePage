import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order } from '../models/order.model';

export interface OrderResponse {
  content: Order[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  private readonly API_URL = `${environment.apiUrl}/admin/orders`;
  private http = inject(HttpClient);

  getAllOrders(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'orderDate',
    sortDir: string = 'desc'
  ): Observable<OrderResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<OrderResponse>(this.API_URL, { params });
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.API_URL}/${id}`);
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    const request: UpdateOrderStatusRequest = { status };
    return this.http.put<Order>(`${this.API_URL}/${id}/status`, request);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getOrderStats(): Observable<OrderStats> {
    return this.http.get<OrderStats>(`${this.API_URL}/stats`);
  }
}
