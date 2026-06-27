import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingProgressComponent } from './components/loading-progress/loading-progress.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingProgressComponent, ToastContainerComponent],
  template: `
    <app-loading-progress></app-loading-progress>
    <app-toast-container></app-toast-container>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  title = 'Family Rent Manager';
}
