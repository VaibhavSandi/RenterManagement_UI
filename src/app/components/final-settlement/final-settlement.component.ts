import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';
import { Renter, Settlement, MonthlyLedgerEntry } from '../../models/interfaces';
import { LanguageService } from '../../services/language.service';
import { SortConfig, sortArray, toggleSort, sortIcon } from '../../utils/table.utils';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-final-settlement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './final-settlement.component.html',
  styleUrls: ['./final-settlement.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinalSettlementComponent implements OnInit, OnDestroy {

  // ── Data ──────────────────────────────────────────────────
  activeRenters: Renter[] = [];
  settlements: Settlement[] = [];
  selectedRenter: Renter | null = null;

  // ── Transaction Ledger ────────────────────────────────────
  transactionLedger: MonthlyLedgerEntry[] = [];
  totalExpected = 0;
  totalPaid = 0;
  totalPending = 0;
  monthsStayed = 0;
  isAllClear = false;

  // ── UI State ─────────────────────────────────────────────
  showSuccess = false;
  showSettlementForm = false;

  // ── Sort ─────────────────────────────────────────────────
  sortConfig: SortConfig = { column: '', direction: '' };
  settlSortConfig: SortConfig = { column: '', direction: '' };

  // ── Search / Filter ───────────────────────────────────────
  filterSearch = '';

  // ── Ledger Pagination ─────────────────────────────────────
  ledgerPage = 1;
  ledgerPageSize = 5;

  // ── Past Settlements Pagination ───────────────────────────
  settlementsPage = 1;
  settlementsPageSize = 5;

  // ── Settlement Form ───────────────────────────────────────
  settlement: any = {
    renterId: 0,
    renterName: '',
    flatNo: '',
    leavingDate: '',
    depositAmount: 0,
    pendingRent: 0,
    deductionAmount: 0,
    deductionReason: '',
    finalRefundAmount: 0,
    settlementDate: ''
  };

  private langSub!: Subscription;

  constructor(
    private dataService: MockDataService,
    public lang: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.activeRenters = this.dataService.getActiveRenters();
    this.settlements = this.dataService.getSettlements();
    this.langSub = this.lang.lang$.subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  // ────────── RENTER SELECTION ──────────────────────────────
  onRenterChange(): void {
    const renter = this.activeRenters.find(r => r.id === +this.settlement.renterId);
    if (renter) {
      this.selectedRenter = renter;
      this.settlement.renterName = renter.renterName;
      this.settlement.flatNo = renter.flatNo;
      this.settlement.depositAmount = renter.depositPaid;
      this.buildTransactionLedger(renter);
      this.ledgerPage = 1;
      this.showSettlementForm = true;
    } else {
      this.selectedRenter = null;
      this.transactionLedger = [];
      this.totalExpected = 0;
      this.totalPaid = 0;
      this.totalPending = 0;
      this.monthsStayed = 0;
      this.isAllClear = false;
      this.showSettlementForm = false;
    }
    this.cdr.markForCheck();
  }

  // ────────── LEDGER BUILDER ─────────────────────────────────
  buildTransactionLedger(renter: Renter): void {
    const payments = this.dataService.getRentPaymentsSorted(renter.id);
    const ledger: MonthlyLedgerEntry[] = [];

    const startDate = new Date(renter.joiningDate);
    const today = new Date();

    // Iterate month by month from joiningDate to current month
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    while (current <= endMonth) {
      const year = current.getFullYear();
      const month = current.getMonth(); // 0-based
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

      const monthName = current.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

      // Find payment(s) for this month
      // Match by payment date falling in this month
      const monthPayments = payments.filter(p => {
        const d = new Date(p.paymentDate);
        return d.getFullYear() === year && d.getMonth() === month;
      });

      // Also try matching by the "month" string field (e.g. "June 2026")
      const monthStrPayments = payments.filter(p => {
        const parts = p.month?.split(' ');
        if (!parts || parts.length < 2) return false;
        const pYear = parseInt(parts[1]);
        const pMonth = new Date(`${parts[0]} 1, ${pYear}`).getMonth();
        return pYear === year && pMonth === month;
      });

      // Merge and deduplicate
      const allMatched = [...monthPayments, ...monthStrPayments].filter(
        (p, idx, arr) => arr.findIndex(x => x.id === p.id) === idx
      );

      const amountPaid = allMatched.reduce((sum, p) => sum + p.amountPaid, 0);
      const expectedRent = renter.monthlyRent;
      const pendingAmount = Math.max(0, expectedRent - amountPaid);

      let status: 'Paid' | 'Partial' | 'Unpaid';
      if (amountPaid >= expectedRent) {
        status = 'Paid';
      } else if (amountPaid > 0) {
        status = 'Partial';
      } else {
        status = 'Unpaid';
      }

      ledger.push({
        month: monthName,
        monthKey,
        expectedRent,
        amountPaid,
        pendingAmount,
        status,
        paymentDate: allMatched[0]?.paymentDate,
        paymentMode: allMatched.map(p => p.paymentMode).join(', ') || undefined,
        remark: allMatched.map(p => p.remark).filter(r => r).join('; ') || undefined
      });

      current.setMonth(current.getMonth() + 1);
    }

    this.transactionLedger = ledger;
    this.monthsStayed = ledger.length;
    this.totalExpected = ledger.reduce((s, e) => s + e.expectedRent, 0);
    this.totalPaid = ledger.reduce((s, e) => s + e.amountPaid, 0);
    this.totalPending = ledger.reduce((s, e) => s + e.pendingAmount, 0);
    this.isAllClear = ledger.every(e => e.status === 'Paid');

    // Auto-fill pending rent in settlement form
    this.settlement.pendingRent = this.totalPending;
    this.calculateRefund();
  }

  // ────────── REFUND CALCULATION ─────────────────────────────
  calculateRefund(): void {
    this.settlement.finalRefundAmount =
      this.settlement.depositAmount
      - this.settlement.pendingRent
      - this.settlement.deductionAmount;
  }

  // ────────── SUBMIT SETTLEMENT ─────────────────────────────
  submitSettlement(): void {
    this.settlement.settlementDate = new Date().toISOString().split('T')[0];
    this.dataService.addSettlement(this.settlement);
    this.showSuccess = true;

    // Reset form
    this.settlement = {
      renterId: 0, renterName: '', flatNo: '', leavingDate: '',
      depositAmount: 0, pendingRent: 0, deductionAmount: 0,
      deductionReason: '', finalRefundAmount: 0, settlementDate: ''
    };
    this.selectedRenter = null;
    this.transactionLedger = [];
    this.totalExpected = 0;
    this.totalPaid = 0;
    this.totalPending = 0;
    this.monthsStayed = 0;
    this.isAllClear = false;
    this.showSettlementForm = false;

    // Refresh data
    this.activeRenters = this.dataService.getActiveRenters();
    this.settlements = this.dataService.getSettlements();
    this.settlementsPage = 1;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.showSuccess = false;
      this.cdr.markForCheck();
    }, 4000);
  }

  // ────────── SORT (ledger table) ───────────────────────────
  onLedgerSort(column: string): void {
    this.sortConfig = toggleSort(this.sortConfig, column);
    this.ledgerPage = 1;
    this.cdr.markForCheck();
  }

  ledgerSortIcon(column: string): string {
    return sortIcon(this.sortConfig, column);
  }

  // ────────── SORT (settlements table) ─────────────────────
  onSort(column: string): void {
    this.settlSortConfig = toggleSort(this.settlSortConfig, column);
    this.settlementsPage = 1;
    this.cdr.markForCheck();
  }

  sortIconClass(column: string): string {
    return sortIcon(this.settlSortConfig, column);
  }

  // ────────── FILTER ────────────────────────────────────────
  resetFilters(): void {
    this.filterSearch = '';
    this.settlementsPage = 1;
    this.cdr.markForCheck();
  }

  get hasActiveFilters(): boolean {
    return this.filterSearch.trim().length > 0;
  }

  // ────────── LEDGER PAGINATION ─────────────────────────────
  get sortedLedger(): MonthlyLedgerEntry[] {
    return sortArray(this.transactionLedger, this.sortConfig.column, this.sortConfig.direction);
  }

  get totalLedgerPages(): number {
    return Math.max(1, Math.ceil(this.sortedLedger.length / this.ledgerPageSize));
  }

  get pagedLedger(): MonthlyLedgerEntry[] {
    const start = (this.ledgerPage - 1) * this.ledgerPageSize;
    return this.sortedLedger.slice(start, start + this.ledgerPageSize);
  }

  get ledgerStartEntry(): number {
    return this.sortedLedger.length === 0 ? 0 : (this.ledgerPage - 1) * this.ledgerPageSize + 1;
  }

  get ledgerEndEntry(): number {
    return Math.min(this.ledgerPage * this.ledgerPageSize, this.sortedLedger.length);
  }

  prevLedgerPage(): void {
    if (this.ledgerPage > 1) { this.ledgerPage--; this.cdr.markForCheck(); }
  }

  nextLedgerPage(): void {
    if (this.ledgerPage < this.totalLedgerPages) { this.ledgerPage++; this.cdr.markForCheck(); }
  }

  onLedgerPageSizeChange(): void {
    this.ledgerPage = 1;
    this.cdr.markForCheck();
  }

  // ────────── SETTLEMENTS PAGINATION ───────────────────────
  get filteredSettlements(): Settlement[] {
    let result = this.settlements;
    if (this.filterSearch.trim()) {
      const q = this.filterSearch.trim().toLowerCase();
      result = result.filter(s =>
        (s.renterName || '').toLowerCase().includes(q) ||
        (s.flatNo || '').toLowerCase().includes(q)
      );
    }
    return sortArray(result, this.settlSortConfig.column, this.settlSortConfig.direction);
  }

  get totalSettlementsPages(): number {
    return Math.max(1, Math.ceil(this.filteredSettlements.length / this.settlementsPageSize));
  }

  get pagedSettlements(): Settlement[] {
    const start = (this.settlementsPage - 1) * this.settlementsPageSize;
    return this.filteredSettlements.slice(start, start + this.settlementsPageSize);
  }

  get settlementsStartEntry(): number {
    return this.filteredSettlements.length === 0 ? 0 :
      (this.settlementsPage - 1) * this.settlementsPageSize + 1;
  }

  get settlementsEndEntry(): number {
    return Math.min(this.settlementsPage * this.settlementsPageSize, this.filteredSettlements.length);
  }

  prevSettlementsPage(): void {
    if (this.settlementsPage > 1) { this.settlementsPage--; this.cdr.markForCheck(); }
  }

  nextSettlementsPage(): void {
    if (this.settlementsPage < this.totalSettlementsPages) { this.settlementsPage++; this.cdr.markForCheck(); }
  }

  onSettlementsPageSizeChange(): void {
    this.settlementsPage = 1;
    this.cdr.markForCheck();
  }

  // ────────── PAGE NUMBERS ARRAY ────────────────────────────
  getLedgerPages(): number[] {
    const total = this.totalLedgerPages;
    const current = this.ledgerPage;
    return this.buildPageRange(current, total);
  }

  getSettlementsPages(): number[] {
    const total = this.totalSettlementsPages;
    const current = this.settlementsPage;
    return this.buildPageRange(current, total);
  }

  private buildPageRange(current: number, total: number): number[] {
    const delta = 2;
    const range: number[] = [];
    const left = Math.max(1, current - delta);
    const right = Math.min(total, current + delta);
    for (let i = left; i <= right; i++) range.push(i);
    return range;
  }

  goToLedgerPage(page: number): void {
    if (page >= 1 && page <= this.totalLedgerPages) {
      this.ledgerPage = page;
      this.cdr.markForCheck();
    }
  }

  goToSettlementsPage(page: number): void {
    if (page >= 1 && page <= this.totalSettlementsPages) {
      this.settlementsPage = page;
      this.cdr.markForCheck();
    }
  }
}
