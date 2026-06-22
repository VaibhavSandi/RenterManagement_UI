import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';
import { Renter, RentPayment } from '../../models/interfaces';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionHistoryComponent implements OnInit, OnDestroy {
  searchQuery = '';
  selectedRenter: Renter | null = null;
  renterPayments: RentPayment[] = [];
  searchResults: Renter[] = [];
  showDropdown = false;
  private langSub!: Subscription;

  constructor(
    private dataService: MockDataService,
    public lang: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.langSub = this.lang.lang$.subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  onSearch(): void {
    if (this.searchQuery.length >= 2) {
      this.searchResults = this.dataService.searchRenters(this.searchQuery);
      this.showDropdown = true;
    } else {
      this.searchResults = [];
      this.showDropdown = false;
    }
    this.cdr.markForCheck();
  }

  selectRenter(renter: Renter): void {
    this.selectedRenter = renter;
    this.searchQuery = renter.renterName;
    this.showDropdown = false;
    this.renterPayments = this.dataService.getPaymentsByRenter(renter.id);
    this.cdr.markForCheck();
  }

  get totalPaid(): number {
    return this.renterPayments.reduce((sum, p) => sum + p.amountPaid, 0);
  }

  get paidMonthsCount(): number {
    return this.renterPayments.length;
  }
}
