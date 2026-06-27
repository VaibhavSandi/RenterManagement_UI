import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardStats, RentPayment, PendingRent } from '../../models/interfaces';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {

  stats!: DashboardStats;
  recentPayments: RentPayment[] = [];
  pendingRents: PendingRent[] = [];
  private langSub!: Subscription;

  // Pending Rents Pagination
  pendingPage = 1;
  pendingPageSize = 5;

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

  // ── Pending Rents Pagination ──────────────────────────────────
  get displayedPendingRents(): PendingRent[] {
    const start = (this.pendingPage - 1) * this.pendingPageSize;
    return this.pendingRents.slice(start, start + this.pendingPageSize);
  }

  get totalPendingPages(): number {
    return Math.max(1, Math.ceil(this.pendingRents.length / this.pendingPageSize));
  }

  get pendingPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPendingPages; i++) pages.push(i);
    return pages;
  }

  goToPendingPage(page: number): void {
    if (page < 1 || page > this.totalPendingPages) return;
    this.pendingPage = page;
    this.cdr.markForCheck();
  }

  changePendingPageSize(size: number): void {
    this.pendingPageSize = +size;
    this.pendingPage = 1;
    this.cdr.markForCheck();
  }

  minVal(a: number, b: number): number {
    return Math.min(a, b);
  }
}