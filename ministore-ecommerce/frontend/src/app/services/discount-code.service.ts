import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DiscountCode, DiscountCodeValidation, ApplyDiscountRequest, CreateDiscountCodeRequest } from '../models/discount-code.model';

@Injectable({
  providedIn: 'root'
})
export class DiscountCodeService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/discount-codes`;
  private readonly ADMIN_API_URL = `${environment.apiUrl}/admin/discount-codes`;

  validateDiscountCode(request: ApplyDiscountRequest): Observable<DiscountCodeValidation> {
    return this.http.post<DiscountCodeValidation>(`${this.API_URL}/validate`, request);
  }

  // Admin methods
  getAllDiscountCodes(): Observable<DiscountCode[]> {
    return this.http.get<DiscountCode[]>(`${this.ADMIN_API_URL}`);
  }

  getDiscountCodeById(id: number): Observable<DiscountCode> {
    return this.http.get<DiscountCode>(`${this.ADMIN_API_URL}/${id}`);
  }

  createDiscountCode(request: CreateDiscountCodeRequest): Observable<DiscountCode> {
    return this.http.post<DiscountCode>(`${this.ADMIN_API_URL}`, request);
  }

  updateDiscountCode(id: number, request: CreateDiscountCodeRequest): Observable<DiscountCode> {
    return this.http.put<DiscountCode>(`${this.ADMIN_API_URL}/${id}`, request);
  }

  deleteDiscountCode(id: number): Observable<void> {
    return this.http.delete<void>(`${this.ADMIN_API_URL}/${id}`);
  }

  // Public method for users to get active discount codes
  getActiveDiscountCodes(): Observable<DiscountCode[]> {
    return this.http.get<DiscountCode[]>(`${this.API_URL}/active`);
  }
}
