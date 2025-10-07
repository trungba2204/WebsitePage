import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { NotificationComponent } from './components/notification/notification.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
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
      });

    // Set initial state
    this.isAdminRoute = this.router.url.startsWith('/admin');
    console.log('🔍 AppComponent - Initial route:', this.router.url, 'isAdminRoute:', this.isAdminRoute);
  }
}

