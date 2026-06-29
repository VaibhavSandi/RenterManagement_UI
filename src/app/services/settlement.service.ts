import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { RentPayment } from '../models/renterPayment.model';
import { Settlement } from '../models/settlement.model';




@Injectable({
  providedIn: 'root'
})
export class SettlementService {

  private apiUrl = `${environment.apiUrl}/api/settlements`;

      private username = 'admin';
  private password = 'admin123';
   headers = {
    Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
  };


  constructor(private http: HttpClient) {}
getAllSettlements(): Observable<Settlement[]> {
    return this.http.get<Settlement[]>(`${this.apiUrl}/allSettlements`, { headers: this.headers });
  }

  getLedger(renterId: number): Observable<RentPayment[]> {
    return this.http.get<RentPayment[]>(`${this.apiUrl}/ledger/${renterId}`, {
      headers: this.headers
    });
  }

  saveSettlement(settlement: Settlement): Observable<Settlement> {
    return this.http.post<Settlement>(`${this.apiUrl}/saveSettlement`, settlement, {
      headers: this.headers
    });
  }

//   getAllSettlements(): Observable<Settlement[]> {
//     return this.http.get<Settlement[]>(this.apiUrl, {
//       headers: this.headers
//     });
//   }

}