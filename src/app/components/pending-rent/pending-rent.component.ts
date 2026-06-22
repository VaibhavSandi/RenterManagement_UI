import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';
import { PendingRent } from '../../models/interfaces';
import { LanguageService } from '../../services/language.service';
import { SortConfig, sortArray, toggleSort, sortIcon } from '../../utils/table.utils';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pending-rent',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pending-rent.component.html',
  styleUrls: ['./pending-rent.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingRentComponent implements OnInit, OnDestroy {
  pendingRents: PendingRent[] = [];
  totalPendingAmount = 0;
  totalPaidAmount = 0;
  totalDefaulters = 0;

  // Filter state
  filterSearch = '';
  filterStatus = '';

  // Sort state
  sortConfig: SortConfig = { column: '', direction: '' };

  private langSub!: Subscription;

  constructor(
    private dataService: MockDataService,
    public lang: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.pendingRents = this.dataService.getPendingRents();
    this.totalPendingAmount = this.pendingRents.reduce((sum, p) => sum + p.pendingAmount, 0);
    this.totalPaidAmount = this.pendingRents.reduce((sum, p) => sum + p.paidAmount, 0);
    this.totalDefaulters = this.pendingRents.length;
    this.langSub = this.lang.lang$.subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
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
    this.filterStatus = '';
    this.cdr.markForCheck();
  }

  get hasActiveFilters(): boolean {
    return this.filterSearch.trim().length > 0 || this.filterStatus.length > 0;
  }

  // ── Computed list ──────────────────────────────────────────────
  get displayedRents(): PendingRent[] {
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

  get filteredTotalPending(): number {
    return this.displayedRents.reduce((sum, p) => sum + p.pendingAmount, 0);
  }

  get filteredTotalPaid(): number {
    return this.displayedRents.reduce((sum, p) => sum + p.paidAmount, 0);
  }
}
