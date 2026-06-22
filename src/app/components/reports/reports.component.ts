import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

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
    { title: 'Monthly Collection Report', description: 'View month-wise rent collection summary', icon: 'bi-calendar-month', color: '#3b82f6', action: 'Generate' },
    { title: 'Pending Rent Report', description: 'View all pending rent details with due dates', icon: 'bi-exclamation-triangle', color: '#ef4444', action: 'Generate' },
    { title: 'Renter Ledger', description: 'Complete transaction history for each renter', icon: 'bi-journal-text', color: '#8b5cf6', action: 'Generate' },
    { title: 'Settlement Report', description: 'View all final settlement records', icon: 'bi-file-check', color: '#22c55e', action: 'Generate' },
    { title: 'Export to Excel', description: 'Download all data in Excel format', icon: 'bi-file-earmark-excel', color: '#15803d', action: 'Export' },
    { title: 'Export to PDF', description: 'Download reports in PDF format', icon: 'bi-file-earmark-pdf', color: '#b91c1c', action: 'Export' },
  ];

  constructor(
    public lang: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.langSub = this.lang.lang$.subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  generateReport(report: any): void {
    this.alertMessage = `${report.title} generated successfully!`;
    this.showAlert = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.showAlert = false;
      this.cdr.markForCheck();
    }, 3000);
  }
}
