import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LanguageService } from '../../services/language.service';
import { SortConfig, sortArray, toggleSort, sortIcon } from '../../utils/table.utils';
import { Subscription } from 'rxjs';
import { RenterPaymentService } from '../../services/renter-payment.service';
import { RentMonthStatus, RenterPendingSummary } from '../../models/rentMonthStatus.model';
import { YearGroup, formatInr, groupByRentYear, shortMonthName, shortRentMonthLabel } from '../../utils/rent-month.utils';

// A report row plus its pending months grouped by year, prepared once on load
export interface PendingReportRow extends RenterPendingSummary {
  yearGroups: YearGroup<RentMonthStatus>[];
}

@Component({
  selector: 'app-pending-rent',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pending-rent.component.html',
  styleUrls: ['./pending-rent.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingRentComponent implements OnInit, OnDestroy {
  // One row per renter with pending rent, calculated by the backend rent ledger
  pendingRents: PendingReportRow[] = [];
  totalPendingAmount = 0;
  totalPendingMonths = 0;
  totalDefaulters = 0;

  // Filter state
  filterSearch = '';

  // Sort state: biggest dues first
  sortConfig: SortConfig = { column: 'totalPending', direction: 'desc' };

  // Pagination state
  currentPage = 1;
  pageSize = 10;

  private langSub!: Subscription;

  constructor(
    public lang: LanguageService,
    private renterpayment: RenterPaymentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getPendingRentest();
    this.langSub = this.lang.lang$.subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  // ── Sort ────────────────────────────────────────────────────────
  onSort(column: string): void {
    this.sortConfig = toggleSort(this.sortConfig, column);
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  sortIconClass(column: string): string {
    return sortIcon(this.sortConfig, column);
  }

  minVal(a: number, b: number): number {
    return Math.min(a, b);
  }


  getPendingRentest(): void {
    // No month given: pending up to the latest due rent month, so future months are never counted
    this.renterpayment.getPendingSummary().subscribe({
      next: (response) => {
        this.pendingRents = response.map(r => ({
          ...r,
          pendingMonthCount: r.pendingMonthCount ?? r.pendingMonths.length,
          yearGroups: groupByRentYear(r.pendingMonths)
        }));
        this.totalPendingAmount = this.pendingRents.reduce((sum, r) => sum + r.totalPending, 0);
        this.totalPendingMonths = this.pendingRents.reduce((sum, r) => sum + r.pendingMonthCount, 0);
        this.totalDefaulters = this.pendingRents.length;
        this.currentPage = 1;
        this.cdr.markForCheck();
      },
      error: () => {
        alert(this.lang.t('pending_rent_err_load'));
        this.cdr.markForCheck();
      }
    });
  }

  resetFilters(): void {
    this.filterSearch = '';
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  get hasActiveFilters(): boolean {
    return this.filterSearch.trim().length > 0;
  }

  // ── Computed list (pre-pagination) ─────────────────────────────
  get filteredRents(): PendingReportRow[] {
    let result = this.pendingRents;

    if (this.filterSearch.trim()) {
      const q = this.filterSearch.trim().toLowerCase();
      result = result.filter(r =>
        r.renterName.toLowerCase().includes(q) ||
        (r.flatNo || '').toLowerCase().includes(q) ||
        (r.mobileNumber || '').includes(q)
      );
    }

    return sortArray(result, this.sortConfig.column, this.sortConfig.direction);
  }

  // ── Paginated slice ────────────────────────────────────────────
  get displayedRents(): PendingReportRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRents.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRents.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.cdr.markForCheck();
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  get filteredTotalPending(): number {
    return this.filteredRents.reduce((sum, r) => sum + r.totalPending, 0);
  }

  get filteredTotalMonths(): number {
    return this.filteredRents.reduce((sum, r) => sum + r.pendingMonthCount, 0);
  }

  // ── Formatting ─────────────────────────────────────────────────
  inr(amount: number | null | undefined): string {
    return formatInr(amount);
  }

  /** e.g. "Aug 2026" */
  monthLabel(month: RentMonthStatus): string {
    return shortRentMonthLabel(month.rentMonth, month.rentYear);
  }

  /** e.g. "Aug" */
  shortMonth(month: RentMonthStatus): string {
    return shortMonthName(month.rentMonth);
  }

  monthLabels(rent: RenterPendingSummary): string {
    return rent.pendingMonths.map(m => this.monthLabel(m)).join(', ');
  }

  /** Tooltip for one pending month, e.g. "Sep 2026: ₹3,000 pending of ₹8,000" */
  monthTitle(month: RentMonthStatus): string {
    return `${this.monthLabel(month)}: ${this.inr(month.pendingAmount)} pending of ${this.inr(month.rentAmount)}`;
  }

  // ── WhatsApp Reminder ──────────────────────────────────────────
  sendWhatsAppReminder(rent: RenterPendingSummary): void {
    let phone = (rent.mobileNumber || '').replace(/\D/g, '');
    if (phone.length === 11 && phone.startsWith('0')) {
      phone = phone.substring(1);
    }
    // Default to India country code if not provided
    if (phone.length === 10) {
      phone = '91' + phone;
    }
    if (phone.length < 11) {
      alert('A valid mobile number was not found for this renter.');
      return;
    }

    const flat = rent.flatNo ? ` for Flat ${rent.flatNo}` : '';
    const message = `Hello ${rent.renterName},\n\nThis is a gentle reminder that your rent of ${this.inr(rent.totalPending)}${flat} is pending for ${this.monthLabels(rent)}.\n\nPlease pay at your earliest convenience. Thank you!`;

    // Opened directly from the click so the browser doesn't block it as a pop-up
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  }
}
