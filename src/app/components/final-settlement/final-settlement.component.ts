import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';
import { Renter, Settlement } from '../../models/interfaces';

@Component({
  selector: 'app-final-settlement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './final-settlement.component.html',
  styleUrls: ['./final-settlement.component.css']
})
export class FinalSettlementComponent implements OnInit {
  activeRenters: Renter[] = [];
  settlements: Settlement[] = [];
  showSuccess = false;

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

  constructor(private dataService: MockDataService) {}

  ngOnInit(): void {
    this.activeRenters = this.dataService.getActiveRenters();
    this.settlements = this.dataService.getSettlements();
  }

  onRenterChange(): void {
    const renter = this.activeRenters.find(r => r.id === +this.settlement.renterId);
    if (renter) {
      this.settlement.renterName = renter.renterName;
      this.settlement.flatNo = renter.flatNo;
      this.settlement.depositAmount = renter.depositPaid;
    }
    this.calculateRefund();
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
    setTimeout(() => this.showSuccess = false, 3000);
  }
}
