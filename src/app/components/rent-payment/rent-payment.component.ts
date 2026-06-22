import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Renter, RentPayment } from '../../models/interfaces';
import { MockDataService } from '../../services/mock-data.service';
import { LanguageService } from '../../services/language.service';
import { SortConfig, sortArray, toggleSort, sortIcon } from '../../utils/table.utils';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rent-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rent-payment.component.html',
  styleUrls: ['./rent-payment.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RentPaymentComponent implements OnInit, OnDestroy {
  activeRenters: Renter[] = [];
  payments: RentPayment[] = [];
  showSuccess = false;
  private langSub!: Subscription;

  // Filter state
  filterSearch = '';
  filterMode = '';

  // Sort state
  sortConfig: SortConfig = { column: '', direction: '' };

  months: string[] = [
    'January 2026', 'February 2026', 'March 2026', 'April 2026',
    'May 2026', 'June 2026', 'July 2026', 'August 2026',
    'September 2026', 'October 2026', 'November 2026', 'December 2026'
  ];

  payment: any = {
    renterId: 0,
    renterName: '',
    flatNo: '',
    month: '',
    amountPaid: 0,
    paymentDate: '',
    paymentMode: 'Cash',
    remark: ''
  };

  constructor(
    private dataService: MockDataService,
    public lang: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.activeRenters = this.dataService.getActiveRenters();
    this.loadPayments();
    this.langSub = this.lang.lang$.subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  loadPayments(): void {
    this.payments = this.dataService.getRentPayments().sort((a, b) =>
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
    this.cdr.markForCheck();
  }

  onRenterChange(): void {
    const renter = this.activeRenters.find(r => r.id === +this.payment.renterId);
    if (renter) {
      this.payment.renterName = renter.renterName;
      this.payment.flatNo = renter.flatNo;
      this.payment.amountPaid = renter.monthlyRent;
    }
    this.cdr.markForCheck();
  }

  submitPayment(): void {
    this.dataService.addPayment(this.payment);
    this.showSuccess = true;
    this.payment = {
      renterId: 0, renterName: '', flatNo: '', month: '',
      amountPaid: 0, paymentDate: '', paymentMode: 'Cash', remark: ''
    };
    this.loadPayments();
    setTimeout(() => {
      this.showSuccess = false;
      this.cdr.markForCheck();
    }, 3000);
  }

  // ── Sort ────────────────────────────────────────────────────────
  onSort(column: string): void {
    this.sortConfig = toggleSort(this.sortConfig, column);
    this.cdr.markForCheck();
  }

  sortIconClass(column: string): string {
    return sortIcon(this.sortConfig, column);
  }

  resetFilters(): void {
    this.filterSearch = '';
    this.filterMode = '';
    this.cdr.markForCheck();
  }

  get hasActiveFilters(): boolean {
    return this.filterSearch.trim().length > 0 || this.filterMode.length > 0;
  }

  // ── Computed list ──────────────────────────────────────────────
  get displayedPayments(): RentPayment[] {
    let result = this.payments;

    if (this.filterSearch.trim()) {
      const q = this.filterSearch.trim().toLowerCase();
      result = result.filter(p =>
        p.renterName.toLowerCase().includes(q) ||
        p.flatNo.toLowerCase().includes(q) ||
        p.month.toLowerCase().includes(q)
      );
    }

    if (this.filterMode) {
      result = result.filter(p => p.paymentMode === this.filterMode);
    }

    return sortArray(result, this.sortConfig.column, this.sortConfig.direction);
  }
}
