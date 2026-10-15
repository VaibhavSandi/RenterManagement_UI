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
import { RentMonthStatus, RenterPendingSummary } from '../../models/rentMonthStatus.model';
import {
  RentMonthOption, buildRentMonthOptions, formatInr, parseRentMonthKey, rentMonthKey, rentMonthLabel, shortRentMonthLabel
} from '../../utils/rent-month.utils';

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
  allRenters: Renter[] = [];
  payments: RentPayment[] = [];
  showSuccess = false;
  private langSub!: Subscription;

  // Filter state
  filterSearch = '';
  filterMode = '';

  // Renter filter: shows every payment of one renter plus their rent summary
  filterRenterId: number | '' = '';
  renterPending: RenterPendingSummary | null = null;
  renterPendingLoading = false;
  renterPendingError = false;
  private renterPendingSub?: Subscription;

  // Backend API Filter state
  backendFilterRenterId: number | '' = '';
  backendFilterFromDate: string = '';
  backendFilterToDate: string = '';
  
  isFilterOpen = false;
  isFilterApplied = false;


  // Month-wise rent status (by rent month, not payment date)
  monthOptions: RentMonthOption[] = [];
  dueMonthKey = '';
  selectedRentMonth = '';
  monthStatusFilter = '';
  monthSearch = '';
  monthRows: RentMonthStatus[] = [];
  monthLoading = false;
  errorMessage = '';

  // Sort state
  sortConfig: SortConfig = { column: '', direction: '' };

  // Pagination state
  currentPage = 1;
  pageSize = 10;



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

        this.allRenters = data;
        this.activeRenters = data.filter(r => r.status === 'Active');
        this.cdr.markForCheck();

      },

      error: (error) => {

        console.error(error);

      }

    });
    this.loadPayments();
    this.initMonthFilter();
    this.langSub = this.lang.lang$.subscribe(() => this.cdr.markForCheck());
  }

  // ── Month-wise rent status ─────────────────────────────────────
  initMonthFilter(): void {
    this.renterservice.getDueMonth().subscribe({
      next: (due) => this.setMonthOptions(due.rentMonth, due.rentYear),
      error: () => {
        // Fall back to the previous month if the backend is unreachable
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        this.setMonthOptions(d.getMonth() + 1, d.getFullYear());
      }
    });
  }

  private setMonthOptions(month: number, year: number): void {
    this.monthOptions = buildRentMonthOptions(month, year);
    this.dueMonthKey = rentMonthKey(month, year);
    this.selectedRentMonth = this.dueMonthKey;
    this.loadMonthStatus();
  }

  loadMonthStatus(): void {
    if (!this.selectedRentMonth) return;
    const { month, year } = parseRentMonthKey(this.selectedRentMonth);
    this.monthLoading = true;
    this.cdr.markForCheck();
    this.renterservice.getMonthStatus(month, year).subscribe({
      next: (rows) => {
        this.monthRows = rows;
        this.monthLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error(error);
        this.monthRows = [];
        this.monthLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  resetMonthFilter(): void {
    this.monthStatusFilter = '';
    this.monthSearch = '';
    if (this.selectedRentMonth !== this.dueMonthKey) {
      this.selectedRentMonth = this.dueMonthKey;
      this.loadMonthStatus();
    }
    this.cdr.markForCheck();
  }

  get filteredMonthRows(): RentMonthStatus[] {
    let result = this.monthRows;
    if (this.monthStatusFilter) {
      result = result.filter(r => r.status === this.monthStatusFilter);
    }
    if (this.monthSearch.trim()) {
      const q = this.monthSearch.trim().toLowerCase();
      result = result.filter(r =>
        (r.renterName || '').toLowerCase().includes(q) ||
        (r.flatNo || '').toLowerCase().includes(q)
      );
    }
    return result;
  }

  monthTotal(field: 'rentAmount' | 'paidAmount' | 'pendingAmount'): number {
    return this.filteredMonthRows.reduce((sum, r) => sum + (r[field] || 0), 0);
  }

  /** Today as YYYY-MM-DD in local time, used to block future dates. */
  get todayKey(): string {
    const d = new Date();
    return `${rentMonthKey(d.getMonth() + 1, d.getFullYear())}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** Current month as YYYY-MM, used to block future months. */
  get currentMonthKey(): string {
    const d = new Date();
    return rentMonthKey(d.getMonth() + 1, d.getFullYear());
  }

  get selectedRentMonthLabel(): string {
    if (!this.selectedRentMonth) return '';
    const { month, year } = parseRentMonthKey(this.selectedRentMonth);
    return rentMonthLabel(month, year);
  }

  /** Month in which the selected rent month is collected, e.g. September rent -> October. */
  get selectedCollectionMonthLabel(): string {
    if (!this.selectedRentMonth || !this.dueMonthKey) return '';
    const due = parseRentMonthKey(this.dueMonthKey);
    const now = new Date();
    const offset = (now.getFullYear() * 12 + now.getMonth() + 1) - (due.year * 12 + due.month);
    const { month, year } = parseRentMonthKey(this.selectedRentMonth);
    const d = new Date(year, month - 1 + offset, 1);
    return rentMonthLabel(d.getMonth() + 1, d.getFullYear());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.renterPendingSub?.unsubscribe();
  }

  loadPayments(): void {
    this.renterservice.getAllRentPayments()
      .subscribe({
        next: (data) => {
          this.payments = data.sort((a, b) =>
            new Date(b.paymentDate ?? '').getTime() -
            new Date(a.paymentDate ?? '').getTime()
          );
          this.isFilterApplied = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  applyBackendFilter(): void {
    const rId = this.backendFilterRenterId === '' ? undefined : +this.backendFilterRenterId;
    const from = this.backendFilterFromDate === '' ? undefined : this.backendFilterFromDate;
    const to = this.backendFilterToDate === '' ? undefined : this.backendFilterToDate;
    
    this.renterservice.filterRentPayments(rId, from, to)
      .subscribe({
        next: (data) => {
          this.payments = data.sort((a, b) =>
            new Date(b.paymentDate ?? '').getTime() -
            new Date(a.paymentDate ?? '').getTime()
          );
          this.currentPage = 1;
          this.isFilterApplied = true;
          this.isFilterOpen = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  toggleFilter(): void {
    this.isFilterOpen = !this.isFilterOpen;
    if (this.isFilterOpen) {
      this.isFilterApplied = true; // Effectively hides the payment details card
    }
    this.cdr.markForCheck();
  }

  clearBackendFilter(): void {
    this.backendFilterRenterId = '';
    this.backendFilterFromDate = '';
    this.backendFilterToDate = '';
    this.isFilterApplied = false;
    this.isFilterOpen = false;
    this.loadPayments();
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
    const monthVal = this.payment.month || '';
    const [yearStr, monthStr] = monthVal.includes('-') ? monthVal.split('-') : [new Date().getFullYear().toString(), (new Date().getMonth() + 1).toString()];
    const selectedRenter = this.activeRenters.find(r => r.renterId === +this.payment.renterId);
    this.errorMessage = '';

    if (this.payment.paymentDate && this.payment.paymentDate > this.todayKey) {
      this.errorMessage = this.lang.t('payment_err_future_date');
      this.cdr.markForCheck();
      return;
    }

const payload: RentPayment = {
  renterId: +this.payment.renterId,
  renterName: this.payment.renterName,
  flatId: selectedRenter?.flatId!,
  flatNo: this.payment.flatNo,
  rentMonth: parseInt(monthStr, 10),
  rentYear: parseInt(yearStr, 10),
  // Rent due for the month, not the amount being paid now
  monthlyRent: selectedRenter?.monthlyRent ?? this.payment.amountPaid,
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
        this.errorMessage = error?.error?.errorMessage || this.lang.t('payment_err_save');
        this.cdr.markForCheck();

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
    this.loadMonthStatus();
    setTimeout(() => {
      this.showSuccess = false;
      this.cdr.markForCheck();
    }, 3000);
  }

  getCycleText(): string {
    if (!this.payment.renterId || !this.payment.month) return '';
    const renter = this.activeRenters.find(r => r.renterId === +this.payment.renterId);
    if (!renter || !renter.joiningDate) return '';

    const joinDateObj = new Date(renter.joiningDate);
    if (isNaN(joinDateObj.getTime())) return '';
    const joinDay = joinDateObj.getDate();
    
    const [yearStr, monthStr] = this.payment.month.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; 

    const startDate = new Date(year, month, joinDay);
    const endDate = new Date(year, month + 1, joinDay);

    return `${startDate.getDate()} ${this.getMonthName(startDate.getMonth())} ${startDate.getFullYear()} - ${endDate.getDate()} ${this.getMonthName(endDate.getMonth())} ${endDate.getFullYear()}`;
  }

  getMonthName(m: number): string {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames[m];
  }

  getCycleForPayment(p: RentPayment): string {
    const renter = this.allRenters.find(r => r.renterId === p.renterId);
    if (renter && renter.joiningDate) {
      const joinDateObj = new Date(renter.joiningDate);
      if (!isNaN(joinDateObj.getTime())) {
        const joinDay = joinDateObj.getDate();
        const startDate = new Date(p.rentYear, p.rentMonth - 1, joinDay);
        const endDate = new Date(p.rentYear, p.rentMonth, joinDay);
        return `${startDate.getDate()} ${this.getMonthName(startDate.getMonth())} ${startDate.getFullYear().toString().slice(-2)} - ${endDate.getDate()} ${this.getMonthName(endDate.getMonth())} ${endDate.getFullYear().toString().slice(-2)}`;
      }
    }
    return `${p.rentMonth}/${p.rentYear}`;
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

  resetFilters(): void {
    this.filterSearch = '';
    this.filterMode = '';
    this.clearRenterFilter();
  }

  get hasActiveFilters(): boolean {
    return this.filterSearch.trim().length > 0 || this.filterMode.length > 0 || this.filterRenterId !== '';
  }

  // ── Renter filter ──────────────────────────────────────────────
  /** All renters by name, current renters first (left renters keep their history). */
  get renterFilterOptions(): Renter[] {
    return [...this.allRenters].sort((a, b) => {
      const aActive = a.status === 'Active' ? 0 : 1;
      const bActive = b.status === 'Active' ? 0 : 1;
      return aActive - bActive || (a.renterName || '').localeCompare(b.renterName || '');
    });
  }

  get selectedFilterRenter(): Renter | undefined {
    return this.filterRenterId === ''
      ? undefined
      : this.allRenters.find(r => r.renterId === +this.filterRenterId);
  }

  onRenterFilterChange(): void {
    this.currentPage = 1;
    this.renterPending = null;
    this.renterPendingError = false;
    this.renterPendingSub?.unsubscribe();

    if (this.filterRenterId === '') {
      this.renterPendingLoading = false;
      this.cdr.markForCheck();
      return;
    }

    this.renterPendingLoading = true;
    this.cdr.markForCheck();
    this.renterPendingSub = this.renterservice.getRenterPendingDetails(+this.filterRenterId).subscribe({
      next: (summary) => {
        this.renterPending = summary;
        this.renterPendingLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error(error);
        this.renterPendingError = true;
        this.renterPendingLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  clearRenterFilter(): void {
    this.filterRenterId = '';
    this.onRenterFilterChange();
  }

  /** Every loaded payment of the selected renter, ignoring the search and mode filters. */
  get selectedRenterPayments(): RentPayment[] {
    if (this.filterRenterId === '') return [];
    const id = +this.filterRenterId;
    return this.payments.filter(p => p.renterId === id);
  }

  get selectedRenterTotalPaid(): number {
    return this.selectedRenterPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  }

  get selectedRenterLastPayment(): string | undefined {
    // payments are sorted newest first
    return this.selectedRenterPayments.find(p => !!p.paymentDate)?.paymentDate;
  }

  get selectedRenterPendingMonths(): string {
    return (this.renterPending?.pendingMonths || [])
      .map(m => shortRentMonthLabel(m.rentMonth, m.rentYear))
      .join(', ');
  }

  inr(amount: number | null | undefined): string {
    return formatInr(amount);
  }

  // ── Computed list (pre-pagination) ─────────────────────────────
  get filteredPayments(): RentPayment[] {
    let result = this.payments;

    if (this.filterRenterId !== '') {
      const id = +this.filterRenterId;
      result = result.filter(p => p.renterId === id);
    }

    if (this.filterSearch.trim()) {
      const q = this.filterSearch.trim().toLowerCase();
      result = result.filter(p =>
        p.renterName!.toLowerCase().includes(q) ||
        p.flatNo!.toLowerCase().includes(q)
      );
    }

    if (this.filterMode) {
      result = result.filter(p => p.paymentMode === this.filterMode);
    }

    return sortArray(result, this.sortConfig.column, this.sortConfig.direction);
  }

  // ── Paginated slice ────────────────────────────────────────────
  get displayedPayments(): RentPayment[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPayments.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPayments.length / this.pageSize));
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

  exportToExcel(): void {
    const data = this.filteredPayments;
    if (!data || data.length === 0) {
      return;
    }

    const renter = this.backendFilterRenterId 
      ? this.activeRenters.find(r => r.renterId === +this.backendFilterRenterId)?.renterName || 'Unknown Renter'
      : 'All Renters';
    
    const fromDate = this.backendFilterFromDate || 'Start';
    const toDate = this.backendFilterToDate || 'Present';

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"></head>
      <body>
        <table>
          <tr><td colspan="9" style="font-size: 16px; font-weight: bold; text-align: center;">Transaction Details</td></tr>
          <tr><td colspan="9" style="font-weight: bold; background-color: #ffff00;">Renter Name: ${renter}</td></tr>
          <tr><td colspan="9" style="font-weight: bold; background-color: #ffff00;">Rent History between ${fromDate} and ${toDate}</td></tr>
          <tr><td colspan="9"></td></tr>
          <tr>
            <th style="font-weight: bold; border: 1px solid #000; background-color: #f2f2f2;">No</th>
            <th style="font-weight: bold; border: 1px solid #000; background-color: #f2f2f2;">Renter Name</th>
            <th style="font-weight: bold; border: 1px solid #000; background-color: #f2f2f2;">Flat No</th>
            <th style="font-weight: bold; border: 1px solid #000; background-color: #f2f2f2;">Month</th>
            <th style="font-weight: bold; border: 1px solid #000; background-color: #f2f2f2;">Year</th>
            <th style="font-weight: bold; border: 1px solid #000; background-color: #f2f2f2;">Amount Paid</th>
            <th style="font-weight: bold; border: 1px solid #000; background-color: #f2f2f2;">Payment Date</th>
            <th style="font-weight: bold; border: 1px solid #000; background-color: #f2f2f2;">Payment Mode</th>
            <th style="font-weight: bold; border: 1px solid #000; background-color: #f2f2f2;">Remark</th>
          </tr>
    `;

    data.forEach((p, index) => {
      html += `
          <tr>
            <td style="border: 1px solid #ddd;">${index + 1}</td>
            <td style="border: 1px solid #ddd;">${p.renterName || ''}</td>
            <td style="border: 1px solid #ddd;">${p.flatNo || ''}</td>
            <td style="border: 1px solid #ddd;">${p.rentMonth}</td>
            <td style="border: 1px solid #ddd;">${p.rentYear}</td>
            <td style="border: 1px solid #ddd;">${p.amountPaid}</td>
            <td style="border: 1px solid #ddd;">${p.paymentDate || ''}</td>
            <td style="border: 1px solid #ddd;">${p.paymentMode || ''}</td>
            <td style="border: 1px solid #ddd;">${p.remark || ''}</td>
          </tr>
      `;
    });

    html += `
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `rent_payments_report_${new Date().toISOString().slice(0,10)}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
