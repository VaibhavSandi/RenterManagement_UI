import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { RentPayment } from '../models/renterPayment.model';
import { PendingRenters } from '../models/PendingRenters.model';
import { DueMonth, RenterPendingSummary, RentMonthStatus } from '../models/rentMonthStatus.model';

@Injectable({
  providedIn: 'root'
})
export class RenterPaymentService {

  private apiUrl = `${environment.apiUrl}/api/rent-payments`;

  private username = 'admin';
  private password = 'admin123';

  private headers = {
    Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
  };

  constructor(private http: HttpClient) {}

  getAllRentPayments(): Observable<RentPayment[]> {
    return this.http.get<RentPayment[]>(`${this.apiUrl}/getAllPayments`, {
      headers: this.headers
    });
  }

  filterRentPayments(renterId?: number, fromDate?: string, toDate?: string): Observable<RentPayment[]> {
    let params: any = {};
    if (renterId) params.renterId = renterId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    
    return this.http.get<RentPayment[]>(`${this.apiUrl}/filter`, {
      headers: this.headers,
      params: params
    });
  }

  createRentPayment(payment: RentPayment): Observable<RentPayment> {
    return this.http.post<RentPayment>(`${this.apiUrl}/savePayment`, payment, {
      headers: this.headers
    });
  }

  updateRentPayment(id: number, payment: RentPayment): Observable<RentPayment> {
    return this.http.put<RentPayment>(`${this.apiUrl}/${id}`, payment, {
      headers: this.headers
    });
  }

  deleteRentPayment(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.headers,
      responseType: 'text'
    });
  }

  getpendingRenter(): Observable<PendingRenters[]> {
    return this.http.get<PendingRenters[]>(`${environment.apiUrl}/api/pending-rents`, {
      headers: this.headers
    });
  }

  // Every renter's rent position for one rent month (month the rent is for)
  getMonthStatus(month: number, year: number): Observable<RentMonthStatus[]> {
    return this.http.get<RentMonthStatus[]>(`${this.apiUrl}/month-status`, {
      headers: this.headers,
      params: { month, year }
    });
  }

  // Latest rent month that is due today (e.g. September when it is October)
  getDueMonth(): Observable<DueMonth> {
    return this.http.get<DueMonth>(`${this.apiUrl}/due-month`, {
      headers: this.headers
    });
  }

  // Pending renters with month-wise breakdown, up to the given rent month
  getPendingSummary(month?: number, year?: number): Observable<RenterPendingSummary[]> {
    const params: any = {};
    if (month && year) {
      params.month = month;
      params.year = year;
    }
    return this.http.get<RenterPendingSummary[]>(`${environment.apiUrl}/api/pending-rents/summary`, {
      headers: this.headers,
      params
    });
  }

  // One renter's month-wise pending rent, up to the latest due rent month
  getRenterPendingDetails(renterId: number): Observable<RenterPendingSummary> {
    return this.http.get<RenterPendingSummary>(`${environment.apiUrl}/api/pending-rents/renter/${renterId}`, {
      headers: this.headers
    });
  }
}