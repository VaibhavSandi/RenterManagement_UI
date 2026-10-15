import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container" *ngIf="isLoading$ | async">
      <div class="progress">
        <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
    </div>
  `,
  styles: [`
    .progress-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 9999;
      height: 4px;
    }
    .progress {
      height: 100%;
      border-radius: 0;
      background-color: transparent;
    }
  `]
})
export class LoadingProgressComponent implements OnInit {
  isLoading$!: Observable<boolean>;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.isLoading$ = this.loadingService.isLoading$;
  }
}
