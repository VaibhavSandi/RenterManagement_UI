import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';
import { Renter, RentPayment } from '../../models/interfaces';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css']
})
export class TransactionHistoryComponent {
  searchQuery = '';
  selectedRenter: Renter | null = null;
  renterPayments: RentPayment[] = [];
  searchResults: Renter[] = [];
  showDropdown = false;

  constructor(private dataService: MockDataService) {}

  onSearch(): void {
    if (this.searchQuery.length >= 2) {
      this.searchResults = this.dataService.searchRenters(this.searchQuery);
      this.showDropdown = true;
    } else {
      this.searchResults = [];
      this.showDropdown = false;
    }
  }

  selectRenter(renter: Renter): void {
    this.selectedRenter = renter;
    this.searchQuery = renter.renterName;
    this.showDropdown = false;
    this.renterPayments = this.dataService.getPaymentsByRenter(renter.id);
  }

  get totalPaid(): number {
    return this.renterPayments.reduce((sum, p) => sum + p.amountPaid, 0);
  }

  get paidMonthsCount(): number {
    return this.renterPayments.length;
  }
}
