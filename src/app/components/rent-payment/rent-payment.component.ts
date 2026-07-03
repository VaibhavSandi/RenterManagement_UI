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
  allRenters: Renter[] = [];
  payments: RentPayment[] = [];
  showSuccess = false;
  private langSub!: Subscription;

  // Filter state
  filterSearch = '';
  filterMode = '';

  // Backend API Filter state
  backendFilterRenterId: number | '' = '';
  backendFilterFromDate: string = '';
  backendFilterToDate: string = '';
  
  isFilterOpen = false;
  isFilterApplied = false;


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

const payload: RentPayment = {
  renterId: +this.payment.renterId,
  renterName: this.payment.renterName,
  flatId: this.activeRenters.find(r => r.renterId === +this.payment.renterId)?.flatId!,
  flatNo: this.payment.flatNo,
  rentMonth: parseInt(monthStr, 10),
  rentYear: parseInt(yearStr, 10),
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
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  get hasActiveFilters(): boolean {
    return this.filterSearch.trim().length > 0 || this.filterMode.length > 0;
  }

  // ── Computed list (pre-pagination) ─────────────────────────────
  get filteredPayments(): RentPayment[] {
    let result = this.payments;

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
