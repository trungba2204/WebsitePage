import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AnalyticsData {
  views: {
    date: string;
    count: number;
  }[];
  revenue: {
    date: string;
    amount: number;
  }[];
  totalViews: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  uniqueVisitors: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly API_URL = `${environment.apiUrl}/admin/analytics`;
  private http = inject(HttpClient);

  getAnalyticsData(period: string = '7d'): Observable<AnalyticsData> {
    return this.http.get<AnalyticsData>(`${this.API_URL}?period=${period}`);
  }
}
