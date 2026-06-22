import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardStats, RentPayment, PendingRent } from '../../models/interfaces';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {

  stats!: DashboardStats;
  recentPayments: RentPayment[] = [];
  pendingRents: PendingRent[] = [];
  private langSub!: Subscription;

  constructor(
    private dashboardService: DashboardService,
    public lang: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.langSub = this.lang.lang$.subscribe(() => this.cdr.markForCheck());
  }

  loadDashboardData(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (response) => {
        this.stats = response.stats;
        this.recentPayments = response.recentPayments;
        this.pendingRents = response.pendingRents;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error(error);
        alert(error?.error?.errorMessage || 'Failed to load dashboard');
      }
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  formatCurrency(amount: number): string {
    return '₹' + (amount || 0).toLocaleString('en-IN');
  }
}