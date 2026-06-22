import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MockDataService } from '../../services/mock-data.service';
import { LanguageService } from '../../services/language.service';
import { SortConfig, sortArray, toggleSort, sortIcon } from '../../utils/table.utils';
import { Subscription } from 'rxjs';
import { RenterPaymentService } from '../../services/renter-payment.service';
import { RentPayment } from '../../models/renterPayment.model';
import { Renter } from '../../models/renter.model';
import { RenterService } from '../../services/renter.service';

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
    private renterservice:RenterPaymentService,
    private renterService: RenterService,
    public lang: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // this.activeRenters = this.dataService.getActiveRenters();
    this.renterService.getAllRenters().subscribe({

      next: (data) => {

        this.activeRenters = data.filter(r => r.status === 'Active');
        this.cdr.markForCheck();

      },

      error: (error) => {

        console.error(error);

      }

    });
    this.loadPayments();
    this.langSub = this.lang.lang$.subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

 loadPayments(): void {

  this.renterservice.getAllRentPayments()
    .subscribe({

      next: (data) => {

        this.payments = data.sort((a, b) =>
          new Date(b.paymentDate ?? '').getTime() -
          new Date(a.paymentDate ?? '').getTime()
        );

        this.cdr.markForCheck();

      },

      error: (error) => {

        console.error(error);

      }

    });

}

  onRenterChange(): void {
    const renter = this.activeRenters.find(r => r.renterId === +this.payment.renterId);
    if (renter) {
      this.payment.renterName = renter.renterName;
      this.payment.flatNo = renter.flatNo;
      this.payment.amountPaid = renter.monthlyRent;
    }
    this.cdr.markForCheck();
  }

  submitPayment(): void {

const payload: RentPayment = {
  renterId: +this.payment.renterId,
  renterName: this.payment.renterName,
  flatId: this.activeRenters.find(r => r.renterId === +this.payment.renterId)?.flatId!,
  flatNo: this.payment.flatNo,
  rentMonth: this.months.indexOf(this.payment.month) + 1,
  rentYear: new Date().getFullYear(),
  monthlyRent: this.payment.amountPaid,
  amountPaid: this.payment.amountPaid,
  paymentDate: this.payment.paymentDate,
  paymentMode: this.payment.paymentMode,
  remark: this.payment.remark
};
    this.renterservice.createRentPayment(payload).subscribe({

      next: (data) => {

        this.showSuccessMessage();

      },

      error: (error) => {

        console.error(error);

      }

    });
  }

  showSuccessMessage(): void {
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
        p.renterName!.toLowerCase().includes(q) ||
        p.flatNo!.toLowerCase().includes(q) 
        // ||
        //  p.rentMonth!.toLowerCase().includes(q)
      );
    }

    if (this.filterMode) {
      result = result.filter(p => p.paymentMode === this.filterMode);
    }

    return sortArray(result, this.sortConfig.column, this.sortConfig.direction);
  }
}
