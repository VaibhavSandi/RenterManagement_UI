import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';
import { Renter, RentPayment } from '../../models/interfaces';

@Component({
  selector: 'app-rent-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rent-payment.component.html',
  styleUrls: ['./rent-payment.component.css']
})
export class RentPaymentComponent implements OnInit {
  activeRenters: Renter[] = [];
  payments: RentPayment[] = [];
  showSuccess = false;

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

  constructor(private dataService: MockDataService) {}

  ngOnInit(): void {
    this.activeRenters = this.dataService.getActiveRenters();
    this.loadPayments();
  }

  loadPayments(): void {
    this.payments = this.dataService.getRentPayments().sort((a, b) =>
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  }

  onRenterChange(): void {
    const renter = this.activeRenters.find(r => r.id === +this.payment.renterId);
    if (renter) {
      this.payment.renterName = renter.renterName;
      this.payment.flatNo = renter.flatNo;
      this.payment.amountPaid = renter.monthlyRent;
    }
  }

  submitPayment(): void {
    this.dataService.addPayment(this.payment);
    this.showSuccess = true;
    this.payment = {
      renterId: 0,
      renterName: '',
      flatNo: '',
      month: '',
      amountPaid: 0,
      paymentDate: '',
      paymentMode: 'Cash',
      remark: ''
    };
    this.loadPayments();
    setTimeout(() => this.showSuccess = false, 3000);
  }
}
