import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Renter } from '../models/renter.model';
import { RentRevision } from '../models/rent-revision.model';


@Injectable({
  providedIn: 'root'
})
export class RenterService {

  private apiUrl = `${environment.apiUrl}/renters`;

     private username = 'admin';
  private password = 'admin123';

   headers = {
    Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
  };

  constructor(private http: HttpClient) {}

  createRenter(renter: Renter): Observable<Renter> {
    return this.http.post<Renter>(`${this.apiUrl}/addrenter`, renter,{headers:this.headers});

    // his.http.post<Flat>(`${this.apiUrl}/FillFlat`, flat, { headers:this.headers });
  }

  getAllRenters(): Observable<Renter[]> {
    return this.http.get<Renter[]>(`${this.apiUrl}`,{headers:this.headers});;
  }

  getRenterById(id: number): Observable<Renter> {
    return this.http.get<Renter>(`${this.apiUrl}/${id}`,{headers:this.headers});
  }

  updateRenter(id: number, renter: Renter): Observable<Renter> {
    return this.http.put<Renter>(`${this.apiUrl}/updaterenter/${id}`, renter,{headers:this.headers});
  }

  deleteRenter(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/deleterenter/${id}`, {headers: this.headers,
      responseType: 'text'
    });
  }

  ActivateRenter(): Observable<string> {
    return this.http.put(`${this.apiUrl}/activaterenter`, null, {headers: this.headers,
      responseType: 'text'
    });
  }

  getRentRevisions(id: number): Observable<RentRevision[]> {
    return this.http.get<RentRevision[]>(`${this.apiUrl}/${id}/revisions`, {headers: this.headers});
  }

  addRentRevision(id: number, revision: RentRevision): Observable<RentRevision> {
    return this.http.post<RentRevision>(`${this.apiUrl}/${id}/revisions`, revision, {headers: this.headers});
  }

  
}