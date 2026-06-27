import { Injectable } from '@angular/core';

export interface Toast {
  textOrTpl: string;
  classname?: string;
  delay?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: Toast[] = [];

  show(textOrTpl: string, options: any = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }

  showSuccess(message: string) {
    this.show(message, { classname: 'bg-success text-light', delay: 5000 });
  }

  showError(message: string) {
    this.show(message, { classname: 'bg-danger text-light', delay: 7000 });
  }

  showInfo(message: string) {
    this.show(message, { classname: 'bg-info text-dark', delay: 5000 });
  }

  remove(toast: Toast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  clear() {
    this.toasts.splice(0, this.toasts.length);
  }
}
