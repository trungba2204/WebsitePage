import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmationModalData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmClass?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationModalService {
  private modalSubject = new BehaviorSubject<ConfirmationModalData | null>(null);
  private resolveSubject = new BehaviorSubject<boolean | null>(null);
  
  modalData$ = this.modalSubject.asObservable();
  resolve$ = this.resolveSubject.asObservable();

  show(data: ConfirmationModalData): Promise<boolean> {
    return new Promise((resolve) => {
      this.modalSubject.next(data);
      
      const subscription = this.resolve$.subscribe(result => {
        if (result !== null) {
          subscription.unsubscribe();
          this.modalSubject.next(null);
          this.resolveSubject.next(null);
          resolve(result);
        }
      });
    });
  }

  confirm(result: boolean): void {
    this.resolveSubject.next(result);
  }
}
