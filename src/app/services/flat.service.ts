import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Flat } from '../models/flat.model';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class FlatService {

  private apiUrl = `${environment.apiUrl}/flat`;

      private username = 'admin';
  private password = 'admin123';

   headers = {
    Authorization: 'Basic ' + btoa(this.username + ':' + this.password)
  };


  constructor(private http: HttpClient) {}

  getAllFlats(): Observable<Flat[]> {
    return this.http.get<Flat[]>(`${this.apiUrl}/getFlatsDetails`, { headers: this.headers });
  }

  createFlat(flat: Flat): Observable<Flat> {
return this.http.post<Flat>(`${this.apiUrl}/FillFlat`, flat, { headers:this.headers });
  } 

  updateFlat(id: number, flat: Flat): Observable<Flat> {
    return this.http.put<Flat>(`${this.apiUrl}/update/${id}`, flat, { headers: this.headers });
  }

  deleteFlat(id: number) {
    return this.http.delete(`${this.apiUrl}/delete/${id}`,  { headers: this.headers ,
    responseType: 'text'
  });
  }
}