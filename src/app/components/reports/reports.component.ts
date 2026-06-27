import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';
import { RenterPaymentService } from '../../services/renter-payment.service';
import { SettlementService } from '../../services/settlement.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit, OnDestroy {
  showAlert = false;
  alertMessage = '';
  private langSub!: Subscription;

  reports = [
    { title: 'Monthly Collection Report', description: 'View month-wise rent collection summary', icon: 'bi-calendar-month', color: '#3b82f6', action: 'Export' },
    { title: 'Pending Rent Report', description: 'View all pending rent details with due dates', icon: 'bi-exclamation-triangle', color: '#ef4444', action: 'Export' },
    { title: 'Settlement Report', description: 'View all final settlement records', icon: 'bi-file-check', color: '#22c55e', action: 'Export' },
    { title: 'Renter Ledger', description: 'Complete transaction history for each renter', icon: 'bi-journal-text', color: '#8b5cf6', action: 'Generate' }
  ];

  constructor(
    public lang: LanguageService,
    private paymentService: RenterPaymentService,
    private settlementService: SettlementService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.langSub = this.lang.lang$.subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  generateReport(report: any): void {
    if (report.title === 'Pending Rent Report') {
      this.paymentService.getpendingRenter().subscribe(data => {
        this.downloadCSV(data, 'Pending_Rent_Report.csv');
      });
    } else if (report.title === 'Monthly Collection Report') {
      this.paymentService.filterRentPayments().subscribe(data => {
        this.downloadCSV(data, 'Rent_Collection_Report.csv');
      });
    } else if (report.title === 'Settlement Report') {
      this.settlementService.getAllSettlements().subscribe(data => {
        this.downloadCSV(data, 'Final_Settlements_Report.csv');
      });
    } else {
      this.alertMessage = `${report.title} feature is coming soon! Please use the Final Settlement tab to view individual ledgers.`;
      this.showAlert = true;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.showAlert = false;
        this.cdr.markForCheck();
      }, 4000);
    }
  }

  private downloadCSV(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] === null || row[header] === undefined ? '' : row[header];
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    this.alertMessage = `${filename} downloaded successfully!`;
    this.showAlert = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.showAlert = false;
      this.cdr.markForCheck();
    }, 3000);
  }
}
