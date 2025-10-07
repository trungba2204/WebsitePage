import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConfirmationModalService, ConfirmationModalData } from '../../services/confirmation-modal.service';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (modalData) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ modalData.title }}</h5>
              <button type="button" class="btn-close" (click)="cancel()"></button>
            </div>
            <div class="modal-body">
              <p class="mb-0">{{ modalData.message }}</p>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary" 
                (click)="cancel()">
                {{ modalData.cancelText || 'Hủy' }}
              </button>
              <button 
                type="button" 
                [class]="'btn ' + (modalData.confirmClass || 'btn-danger')" 
                (click)="confirm()">
                {{ modalData.confirmText || 'Xác nhận' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal.show {
      display: block !important;
    }
  `]
})
export class ConfirmationModalComponent implements OnInit, OnDestroy {
  private confirmationService = inject(ConfirmationModalService);
  
  modalData: ConfirmationModalData | null = null;
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.subscription.add(
      this.confirmationService.modalData$.subscribe(data => {
        this.modalData = data;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  confirm(): void {
    this.confirmationService.confirm(true);
  }

  cancel(): void {
    this.confirmationService.confirm(false);
  }
}
