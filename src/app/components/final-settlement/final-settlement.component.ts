import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';
import { Renter, Settlement } from '../../models/interfaces';
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
  activeRenters: Renter[] = [];
  settlements: Settlement[] = [];
  showSuccess = false;

  sortConfig: SortConfig = { column: '', direction: '' };

  // Filter state
  filterSearch = '';

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

  onRenterChange(): void {
    const renter = this.activeRenters.find(r => r.id === +this.settlement.renterId);
    if (renter) {
      this.settlement.renterName = renter.renterName;
      this.settlement.flatNo = renter.flatNo;
      this.settlement.depositAmount = renter.depositPaid;
    }
    this.calculateRefund();
    this.cdr.markForCheck();
  }

  calculateRefund(): void {
    this.settlement.finalRefundAmount =
      this.settlement.depositAmount - this.settlement.pendingRent - this.settlement.deductionAmount;
  }

  submitSettlement(): void {
    this.settlement.settlementDate = new Date().toISOString().split('T')[0];
    this.dataService.addSettlement(this.settlement);
    this.showSuccess = true;
    this.settlement = {
      renterId: 0, renterName: '', flatNo: '', leavingDate: '',
      depositAmount: 0, pendingRent: 0, deductionAmount: 0,
      deductionReason: '', finalRefundAmount: 0, settlementDate: ''
    };
    this.activeRenters = this.dataService.getActiveRenters();
    this.settlements = this.dataService.getSettlements();
    this.cdr.markForCheck();
    setTimeout(() => {
      this.showSuccess = false;
      this.cdr.markForCheck();
    }, 3000);
  }

  onSort(column: string): void {
    this.sortConfig = toggleSort(this.sortConfig, column);
    this.cdr.markForCheck();
  }

  sortIconClass(column: string): string {
    return sortIcon(this.sortConfig, column);
  }

  resetFilters(): void {
    this.filterSearch = '';
    this.cdr.markForCheck();
  }

  get hasActiveFilters(): boolean {
    return this.filterSearch.trim().length > 0;
  }

  get displayedSettlements(): Settlement[] {
    let result = this.settlements;

    if (this.filterSearch.trim()) {
      const q = this.filterSearch.trim().toLowerCase();
      result = result.filter(s =>
        (s.renterName || '').toLowerCase().includes(q) ||
        (s.flatNo || '').toLowerCase().includes(q)
      );
    }

    return sortArray(result, this.sortConfig.column, this.sortConfig.direction);
  }
}
