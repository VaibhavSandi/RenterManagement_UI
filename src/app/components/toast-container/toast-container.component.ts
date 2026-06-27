import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 10000">
      <div *ngFor="let toast of toastService.toasts; let i = index"
           class="toast show align-items-center border-0 mb-2 {{toast.classname}}" 
           role="alert" 
           aria-live="assertive" 
           aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            {{ toast.textOrTpl }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                  aria-label="Close" 
                  (click)="removeToast(toast)"></button>
        </div>
      </div>
    </div>
  `
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  private intervals: Map<Toast, any> = new Map();

  constructor(public toastService: ToastService) {}

  ngOnInit() {
    // Basic polling mechanism for delay simulation since we are not using NgbToast.
    // A better approach in a real app is to handle it via Observables or setTimeout.
    setInterval(() => this.checkToasts(), 1000);
  }

  ngOnDestroy() {
    this.intervals.forEach((val) => clearInterval(val));
  }

  checkToasts() {
    this.toastService.toasts.forEach(toast => {
      if (toast.delay && !this.intervals.has(toast)) {
        const timeout = setTimeout(() => this.removeToast(toast), toast.delay);
        this.intervals.set(toast, timeout);
      }
    });
  }

  removeToast(toast: Toast) {
    this.toastService.remove(toast);
    if (this.intervals.has(toast)) {
      clearTimeout(this.intervals.get(toast));
      this.intervals.delete(toast);
    }
  }
}
