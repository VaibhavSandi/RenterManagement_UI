import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../services/mock-data.service';
import { PendingRent } from '../../models/interfaces';

@Component({
  selector: 'app-pending-rent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-rent.component.html',
  styleUrls: ['./pending-rent.component.css']
})
export class PendingRentComponent implements OnInit {
  pendingRents: PendingRent[] = [];
  totalPendingAmount = 0;
  totalPaidAmount = 0;
  totalDefaulters = 0;

  constructor(private dataService: MockDataService) {}

  ngOnInit(): void {
    this.pendingRents = this.dataService.getPendingRents();
    this.totalPendingAmount = this.pendingRents.reduce((sum, p) => sum + p.pendingAmount, 0);
    this.totalPaidAmount = this.pendingRents.reduce((sum, p) => sum + p.paidAmount, 0);
    this.totalDefaulters = this.pendingRents.length;
  }
}
