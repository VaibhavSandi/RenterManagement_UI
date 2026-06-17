import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { DashboardStats, RentPayment, PendingRent } from '../../models/interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats!: DashboardStats;
  recentPayments: RentPayment[] = [];
  pendingRents: PendingRent[] = [];

  constructor(private dataService: MockDataService) {}

  ngOnInit(): void {
    this.stats = this.dataService.getDashboardStats();
    this.recentPayments = this.dataService.getRentPayments().slice(0, 5);
    this.pendingRents = this.dataService.getPendingRents();
  }

  formatCurrency(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN');
  }
}
