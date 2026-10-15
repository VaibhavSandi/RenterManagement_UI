import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RenterPendingSummary } from '../models/rentMonthStatus.model';

// Figures calculated by the backend rent ledger
export interface DashboardStatsData {
  totalFlats: number;
  occupiedFlats: number;
  vacantFlats: number;
  activeRenters: number;
  totalRenters: number;

  // Rent month the period figures are for
  rentMonth: number;
  rentYear: number;
  rentPeriod: string;

  expectedRent: number;
  collectedAmount: number;
  // Unpaid balance of the selected rent month only
  pendingAmount: number;

  // All months up to the latest due rent month, as of today
  totalOutstanding: number;
  overdueRenters: number;
  outstandingAsOfPeriod: string;

  totalExpenses: number;
}

export interface DashboardPayment {
  paymentId: number;
  renterId: number;
  renterName: string;
  flatNo?: string;
  rentMonth: number;
  rentYear: number;
  amountPaid: number;
  paymentMode?: string;
  paymentDate?: string;
}

export interface MonthlyRentTotals {
  rentMonth: number;
  rentYear: number;
  rentPeriod: string;
  expectedRent: number;
  collectedRent: number;
  pendingRent: number;
  renterCount: number;
}

export interface DashboardResponse {
  stats: DashboardStatsData;
  recentPayments: DashboardPayment[];
  pendingRenters: RenterPendingSummary[];
  monthlyTrend: MonthlyRentTotals[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = `${environment.apiUrl}/api/dashboard`;

  private headers = {
    Authorization: 'Basic ' + btoa('admin:admin123')
  };

  constructor(private http: HttpClient) {}

  /** No month/year: the backend uses the latest due rent month. */
  getDashboardData(month?: number, year?: number): Observable<DashboardResponse> {
    const params: Record<string, number> = {};
    if (month && year) {
      params['month'] = month;
      params['year'] = year;
    }
    return this.http.get<DashboardResponse>(`${this.apiUrl}/getData`, {
      headers: this.headers,
      params
    });
  }
}
