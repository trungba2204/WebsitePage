import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

interface AnalyticsData {
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
}

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-analytics.component.html',
  styleUrl: './admin-analytics.component.scss'
})
export class AdminAnalyticsComponent implements OnInit {
  adminService = inject(AdminService);

  analyticsData: AnalyticsData | null = null;
  isLoading = false;
  selectedPeriod = '7d'; // 7d, 30d, 90d

  periods = [
    { value: '7d', label: '7 ngày qua' },
    { value: '30d', label: '30 ngày qua' },
    { value: '90d', label: '90 ngày qua' }
  ];

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  loadAnalyticsData(): void {
    this.isLoading = true;
    this.adminService.getAnalyticsData(this.selectedPeriod).subscribe({
      next: (data) => {
        this.analyticsData = data;
        this.isLoading = false;
        console.log('✅ AdminAnalytics - Analytics data loaded:', data);
      },
      error: (error) => {
        console.error('❌ AdminAnalytics - Error loading analytics data:', error);
        this.isLoading = false;
        // Mock data for development
        this.loadMockData();
      }
    });
  }

  onPeriodChange(): void {
    this.loadAnalyticsData();
  }


  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('vi-VN').format(num);
  }

  private loadMockData(): void {
    // Mock data for development/testing
    const mockData: AnalyticsData = {
      views: [
        { date: '2025-10-01', count: 1250 },
        { date: '2025-10-02', count: 1380 },
        { date: '2025-10-03', count: 1150 },
        { date: '2025-10-04', count: 1620 },
        { date: '2025-10-05', count: 1890 },
        { date: '2025-10-06', count: 2100 },
        { date: '2025-10-07', count: 1950 }
      ],
      revenue: [
        { date: '2025-10-01', amount: 2500000 },
        { date: '2025-10-02', amount: 3200000 },
        { date: '2025-10-03', amount: 2800000 },
        { date: '2025-10-04', amount: 4100000 },
        { date: '2025-10-05', amount: 5200000 },
        { date: '2025-10-06', amount: 6800000 },
        { date: '2025-10-07', amount: 5900000 }
      ],
      totalViews: 11340,
      totalRevenue: 30500000,
      averageOrderValue: 2689
    };
    
    this.analyticsData = mockData;
    this.isLoading = false;
    console.log('📊 AdminAnalytics - Mock data loaded');
  }

  getGrowthRate(current: number, previous: number): number {
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  }

  getViewsGrowthRate(): number {
    if (!this.analyticsData || this.analyticsData.views.length < 2) return 0;
    const current = this.analyticsData.views[this.analyticsData.views.length - 1].count;
    const previous = this.analyticsData.views[this.analyticsData.views.length - 2].count;
    return this.getGrowthRate(current, previous);
  }

  getRevenueGrowthRate(): number {
    if (!this.analyticsData || this.analyticsData.revenue.length < 2) return 0;
    const current = this.analyticsData.revenue[this.analyticsData.revenue.length - 1].amount;
    const previous = this.analyticsData.revenue[this.analyticsData.revenue.length - 2].amount;
    return this.getGrowthRate(current, previous);
  }

  // Chart helper methods
  getViewBarHeight(count: number): number {
    if (!this.analyticsData || this.analyticsData.views.length === 0) return 10;
    const maxViews = Math.max(...this.analyticsData.views.map(v => v.count));
    return Math.max(10, (count / maxViews) * 100);
  }

  getRevenueBarHeight(amount: number): number {
    if (!this.analyticsData || this.analyticsData.revenue.length === 0) return 10;
    const maxRevenue = Math.max(...this.analyticsData.revenue.map(r => r.amount));
    return Math.max(10, (amount / maxRevenue) * 100);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  }

  formatCurrencyShort(amount: number): string {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K';
    }
    return amount.toString();
  }

  // Stats helper methods
  getTotalOrders(): number {
    if (!this.analyticsData) return 0;
    return Math.round(this.analyticsData.totalRevenue / this.analyticsData.averageOrderValue);
  }

  getMaxViews(): number {
    if (!this.analyticsData || this.analyticsData.views.length === 0) return 0;
    return Math.max(...this.analyticsData.views.map(v => v.count));
  }

  getMaxRevenue(): number {
    if (!this.analyticsData || this.analyticsData.revenue.length === 0) return 0;
    return Math.max(...this.analyticsData.revenue.map(r => r.amount));
  }

  getSelectedPeriodLabel(): string {
    const period = this.periods.find(p => p.value === this.selectedPeriod);
    return period ? period.label : '7 ngày qua';
  }
}
