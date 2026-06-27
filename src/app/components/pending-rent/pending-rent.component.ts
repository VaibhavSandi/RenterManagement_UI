import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LanguageService } from '../../services/language.service';
import { SortConfig, sortArray, toggleSort, sortIcon } from '../../utils/table.utils';
import { Subscription } from 'rxjs';
import { RenterPaymentService } from '../../services/renter-payment.service';
import { PendingRent } from '../../models/interfaces';
import { PendingRenters } from '../../models/PendingRenters.model';
import { RenterService } from '../../services/renter.service';

@Component({
  selector: 'app-pending-rent',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pending-rent.component.html',
  styleUrls: ['./pending-rent.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingRentComponent implements OnInit, OnDestroy {
  pendingRents: PendingRenters[] = [];
  totalPendingAmount = 0;
  totalPaidAmount = 0;
  totalDefaulters = 0;

  // Filter state
  filterSearch = '';
  filterStatus = '';

  // Sort state
  sortConfig: SortConfig = { column: '', direction: '' };

  // Pagination state
  currentPage = 1;
  pageSize = 10;

  private langSub!: Subscription;

  constructor(

    public lang: LanguageService,
    private renterpayment: RenterPaymentService,
    private renterService: RenterService,
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
    this.renterpayment.getpendingRenter().subscribe({
      next: (response) => {
        this.pendingRents = response;
        this.totalPendingAmount = this.pendingRents.reduce((sum, p) => sum + p.pendingAmount, 0);
        this.totalPaidAmount = this.pendingRents.reduce((sum, p) => sum + p.paidAmount, 0);
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
    this.filterStatus = '';
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  get hasActiveFilters(): boolean {
    return this.filterSearch.trim().length > 0 || this.filterStatus.length > 0;
  }

  // ── Computed list (pre-pagination) ─────────────────────────────
  get filteredRents(): PendingRenters[] {
    let result = this.pendingRents;

    if (this.filterSearch.trim()) {
      const q = this.filterSearch.trim().toLowerCase();
      result = result.filter(r =>
        r.renterName.toLowerCase().includes(q) ||
        r.flatNo.toLowerCase().includes(q)
      );
    }

    if (this.filterStatus) {
      result = result.filter(r => r.status === this.filterStatus);
    }

    return sortArray(result, this.sortConfig.column, this.sortConfig.direction);
  }

  // ── Paginated slice ────────────────────────────────────────────
  get displayedRents(): PendingRenters[] {
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
    return this.filteredRents.reduce((sum, p) => sum + p.pendingAmount, 0);
  }

  get filteredTotalPaid(): number {
    return this.filteredRents.reduce((sum, p) => sum + p.paidAmount, 0);
  }

  // ── WhatsApp Reminder ──────────────────────────────────────────
  sendWhatsAppReminder(rent: PendingRenters): void {
    this.renterService.getRenterById(rent.renterId).subscribe({
      next: (renter) => {
        if (!renter.mobileNumber) {
          alert('Mobile number not found for this renter.');
          return;
        }

        const rawPhone = renter.mobileNumber.replace(/\D/g, '');
        // Default to India country code if not provided
        const phone = rawPhone.length === 10 ? '91' + rawPhone : rawPhone;

        const message = `Hello ${rent.renterName},\n\nThis is a gentle reminder that your rent of ₹${rent.pendingAmount} for Flat ${rent.flatNo} is currently pending.\n\nPlease pay at your earliest convenience. Thank you!`;
        const encodedMessage = encodeURIComponent(message);
        const waUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

        window.open(waUrl, '_blank');
      },
      error: () => {
        alert('Failed to retrieve renter details for WhatsApp reminder.');
      }
    });
  }
}
