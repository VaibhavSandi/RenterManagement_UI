import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { RentPayment } from '../models/renterPayment.model';
import { PendingRenters } from '../models/PendingRenters.model';

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
}