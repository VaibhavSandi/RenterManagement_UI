import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import {
  DashboardService, DashboardStatsData, DashboardPayment, MonthlyRentTotals
} from '../../services/dashboard.service';
import { LanguageService } from '../../services/language.service';
import { RentMonthStatus, RenterPendingSummary } from '../../models/rentMonthStatus.model';
import {
  RentMonthOption, YearGroup, buildRentMonthOptions, formatInr, groupByRentYear,
  parseRentMonthKey, rentMonthKey, shortMonthName, shortRentMonthLabel
} from '../../utils/rent-month.utils';

// Pending months shown per renter before "+N more"
const MAX_VISIBLE_MONTHS = 6;
// Renters shown before "Show all"
const PENDING_PREVIEW_ROWS = 8;

type PendingStatus = 'overdue' | 'partial';

interface DashboardPendingRow extends RenterPendingSummary {
  status: PendingStatus;
  visibleGroups: YearGroup<RentMonthStatus>[];
  hiddenMonthCount: number;
}

interface TrendBar extends MonthlyRentTotals {
  label: string;          // 'Sep'
  fullLabel: string;      // 'Sep 2026'
  collectedHeight: number; // % of the tallest month
  pendingHeight: number;
  collectedPercent: number | null; // collected / expected
  selected: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {

  // Request state: figures are only shown after a successful load, never as zeros
  loading = true;
  errorMessage: string | null = null;

  stats: DashboardStatsData | null = null;
  recentPayments: DashboardPayment[] = [];
  pendingRows: DashboardPendingRow[] = [];
  trendBars: TrendBar[] = [];

  // Period filter (rent month); options are built around the latest due month
  periodOptions: RentMonthOption[] = [];
  selectedPeriodKey = '';

  // Pending section filters
  pendingSearch = '';
  pendingStatusFilter: '' | PendingStatus = '';
  showAllPending = false;

  private langSub!: Subscription;
  private dataSub?: Subscription;

  constructor(
    private dashboardService: DashboardService,
    public lang: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.langSub = this.lang.lang$.subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.dataSub?.unsubscribe();
  }

  loadDashboardData(): void {
    const period = this.selectedPeriodKey ? parseRentMonthKey(this.selectedPeriodKey) : null;

    this.loading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    // A newer request replaces one still in flight
    this.dataSub?.unsubscribe();
    this.dataSub = this.dashboardService.getDashboardData(period?.month, period?.year).subscribe({
      next: (response) => {
        this.stats = response.stats;
        this.recentPayments = response.recentPayments ?? [];
        this.pendingRows = (response.pendingRenters ?? []).map(r => this.toPendingRow(r));
        this.trendBars = this.toTrendBars(response.monthlyTrend ?? [], response.stats);

        // First load: the backend picked the latest due month; anchor the period list on it
        if (!this.selectedPeriodKey) {
          this.selectedPeriodKey = rentMonthKey(response.stats.rentMonth, response.stats.rentYear);
          this.periodOptions = buildRentMonthOptions(response.stats.rentMonth, response.stats.rentYear, 24, 0);
        }

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
        this.errorMessage = error?.error?.errorMessage
          || (error?.status === 0 ? this.lang.t('dashboard_err_offline') : this.lang.t('dashboard_err_load'));
        this.cdr.markForCheck();
      }
    });
  }

  onPeriodChange(): void {
    this.loadDashboardData();
  }

  get isLatestPeriod(): boolean {
    return !!this.stats && this.periodOptions.length > 0 && this.selectedPeriodKey === this.periodOptions[0].key;
  }

  // ── Cards ──────────────────────────────────────────────────────
  get collectionPercent(): number | null {
    if (!this.stats || !this.stats.expectedRent) return null;
    return Math.round((this.stats.collectedAmount / this.stats.expectedRent) * 100);
  }

  get netIncome(): number {
    return this.stats ? this.stats.collectedAmount - this.stats.totalExpenses : 0;
  }

  // ── Pending section ────────────────────────────────────────────
  private toPendingRow(r: RenterPendingSummary): DashboardPendingRow {
    const months = r.pendingMonths ?? [];
    const visible = months.slice(0, MAX_VISIBLE_MONTHS);
    return {
      ...r,
      pendingMonthCount: r.pendingMonthCount ?? months.length,
      // Only partly paid months left = attention needed; any fully unpaid month = overdue
      status: months.length > 0 && months.every(m => m.status === 'Partial') ? 'partial' : 'overdue',
      visibleGroups: groupByRentYear(visible),
      hiddenMonthCount: Math.max(0, months.length - visible.length)
    };
  }

  get filteredPendingRows(): DashboardPendingRow[] {
    let rows = this.pendingRows;
    const q = this.pendingSearch.trim().toLowerCase();
    if (q) {
      rows = rows.filter(r =>
        r.renterName.toLowerCase().includes(q) ||
        (r.flatNo || '').toLowerCase().includes(q) ||
        (r.mobileNumber || '').includes(q));
    }
    if (this.pendingStatusFilter) {
      rows = rows.filter(r => r.status === this.pendingStatusFilter);
    }
    return rows;
  }

  get displayedPendingRows(): DashboardPendingRow[] {
    const rows = this.filteredPendingRows;
    return this.showAllPending ? rows : rows.slice(0, PENDING_PREVIEW_ROWS);
  }

  get hiddenPendingRowCount(): number {
    return Math.max(0, this.filteredPendingRows.length - PENDING_PREVIEW_ROWS);
  }

  toggleShowAllPending(): void {
    this.showAllPending = !this.showAllPending;
    this.cdr.markForCheck();
  }

  clearPendingFilters(): void {
    this.pendingSearch = '';
    this.pendingStatusFilter = '';
    this.cdr.markForCheck();
  }

  // ── Trend chart ────────────────────────────────────────────────
  private toTrendBars(totals: MonthlyRentTotals[], stats: DashboardStatsData): TrendBar[] {
    const max = Math.max(1, ...totals.map(t => Math.max(t.expectedRent, t.collectedRent + t.pendingRent)));
    return totals.map(t => ({
      ...t,
      label: shortMonthName(t.rentMonth),
      fullLabel: shortRentMonthLabel(t.rentMonth, t.rentYear),
      collectedHeight: (t.collectedRent / max) * 100,
      pendingHeight: (t.pendingRent / max) * 100,
      collectedPercent: t.expectedRent > 0 ? Math.round((t.collectedRent / t.expectedRent) * 100) : null,
      selected: t.rentMonth === stats.rentMonth && t.rentYear === stats.rentYear
    }));
  }

  trendTitle(bar: TrendBar): string {
    return `${bar.fullLabel}\nExpected: ${this.inr(bar.expectedRent)}\nCollected: ${this.inr(bar.collectedRent)}\nPending: ${this.inr(bar.pendingRent)}`;
  }

  // ── Formatting ─────────────────────────────────────────────────
  inr(amount: number | null | undefined): string {
    return formatInr(amount);
  }

  shortMonth(m: RentMonthStatus): string {
    return shortMonthName(m.rentMonth);
  }

  monthTitle(m: RentMonthStatus): string {
    return `${shortRentMonthLabel(m.rentMonth, m.rentYear)}: ${this.inr(m.pendingAmount)} pending of ${this.inr(m.rentAmount)}`;
  }

  paymentPeriod(p: DashboardPayment): string {
    return p.rentMonth && p.rentYear ? shortRentMonthLabel(p.rentMonth, p.rentYear) : '—';
  }

  trackByRenter(_: number, r: RenterPendingSummary): number {
    return r.renterId;
  }

  trackByPayment(_: number, p: DashboardPayment): number {
    return p.paymentId;
  }
}
