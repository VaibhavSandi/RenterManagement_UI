import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardStats, RentPayment, PendingRent } from '../models/interfaces';

export interface DashboardResponse {
  stats: DashboardStats;
  recentPayments: RentPayment[];
  pendingRents: PendingRent[];
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

  getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/getData`, {
      headers: this.headers
    });

   
  }

    
}