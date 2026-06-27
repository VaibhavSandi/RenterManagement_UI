import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardStats, RentPayment, PendingRent } from '../models/interfaces';
import { parkingmodel } from '../models/parking.model';


export interface DashboardResponse {
  stats: DashboardStats;
  recentPayments: RentPayment[];
  pendingRents: PendingRent[];
}

@Injectable({
  providedIn: 'root'
})
export class ParkingService {

  private apiUrl = `${environment.apiUrl}/parking`;

  private headers = {
    Authorization: 'Basic ' + btoa('admin:admin123')
  };

  constructor(private http: HttpClient) {}

 getAllParkingDeatils():Observable<parkingmodel[]>{

    return this.http.get<parkingmodel[]>(`${this.apiUrl}/allParkingDetails`,{
        headers:this.headers
    })

 }
  getActivateParking():Observable<parkingmodel[]>{

    return this.http.get<parkingmodel[]>(`${this.apiUrl}/getParkingBystatus`,{

        headers:this.headers
    })
  }  



    

}
   
  

    
