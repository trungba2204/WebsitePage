import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-settings">
      <h1>Cài đặt hệ thống</h1>
      <p>Trang cài đặt hệ thống - Đang phát triển</p>
    </div>
  `,
  styles: [`
    .admin-settings {
      padding: 2rem;
    }
  `]
})
export class AdminSettingsComponent {}
