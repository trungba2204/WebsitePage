import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { NotificationComponent } from './components/notification/notification.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { ViewTrackingService } from './services/view-tracking.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, NotificationComponent, ConfirmationModalComponent],
  template: `
    @if (!isAdminRoute) {
      <app-header></app-header>
    }
    <main [class.admin-main]="isAdminRoute">
      <router-outlet></router-outlet>
    </main>
    @if (!isAdminRoute) {
      <app-footer></app-footer>
    }
    <app-notification></app-notification>
    <app-confirmation-modal></app-confirmation-modal>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    main {
      flex: 1;
    }
    
    main.admin-main {
      flex: 1;
      height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'MiniStore';
  router = inject(Router);
  viewTrackingService = inject(ViewTrackingService);
  isAdminRoute = false;

  ngOnInit(): void {
    // Track route changes to determine if current route is admin
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = (event as NavigationEnd).url;
        // Hide navbar/footer for ALL admin routes including login
        this.isAdminRoute = url.startsWith('/admin');
        console.log('🔍 AppComponent - Route changed:', url, 'isAdminRoute:', this.isAdminRoute);
        
        // Special debug for user form
        if (url.includes('/admin/users/new')) {
          console.log('🔍 AppComponent - Navigating to admin user form');
        }
        
        // Track page view for analytics
        this.trackPageView(url);
      });

    // Set initial state
    this.isAdminRoute = this.router.url.startsWith('/admin');
    console.log('🔍 AppComponent - Initial route:', this.router.url, 'isAdminRoute:', this.isAdminRoute);
    
    // Track initial page view
    this.trackPageView(this.router.url);
  }

  private trackPageView(url: string): void {
    // Skip tracking for admin routes
    if (url.startsWith('/admin')) {
      return;
    }

    // Extract page name from URL
    let pageName = url;
    if (url === '/' || url === '') {
      pageName = 'home';
    } else if (url.startsWith('/products/')) {
      pageName = 'product-detail';
    } else if (url.startsWith('/products')) {
      pageName = 'products';
    } else if (url.startsWith('/blogs/')) {
      pageName = 'blog-detail';
    } else if (url.startsWith('/blogs')) {
      pageName = 'blogs';
    } else if (url.startsWith('/orders/')) {
      pageName = 'order-detail';
    } else if (url.startsWith('/orders')) {
      pageName = 'orders';
    } else if (url.startsWith('/favorites')) {
      pageName = 'favorites';
    } else if (url.startsWith('/profile')) {
      pageName = 'profile';
    } else if (url.startsWith('/checkout')) {
      pageName = 'checkout';
    } else if (url.startsWith('/cart')) {
      pageName = 'cart';
    } else if (url.startsWith('/promotions')) {
      pageName = 'promotions';
    } else if (url.startsWith('/about')) {
      pageName = 'about';
    } else if (url.startsWith('/contact')) {
      pageName = 'contact';
    } else {
      // Remove leading slash and use as page name
      pageName = url.substring(1) || 'home';
    }

    // Track the view
    this.viewTrackingService.trackView(pageName);
  }
}

