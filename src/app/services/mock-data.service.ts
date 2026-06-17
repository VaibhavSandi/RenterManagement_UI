import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  Flat, Renter, RentPayment, PendingRent, Settlement, DashboardStats, User
} from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  // ── Flats ──
  private flats: Flat[] = [
    { id: 1, flatNo: 'A-101', buildingName: 'Sunshine Residency', monthlyRent: 8000, depositAmount: 24000, status: 'Occupied' },
    { id: 2, flatNo: 'A-102', buildingName: 'Sunshine Residency', monthlyRent: 8500, depositAmount: 25500, status: 'Occupied' },
    { id: 3, flatNo: 'A-103', buildingName: 'Sunshine Residency', monthlyRent: 9000, depositAmount: 27000, status: 'Vacant' },
    { id: 4, flatNo: 'B-201', buildingName: 'Green Valley Apt', monthlyRent: 7500, depositAmount: 22500, status: 'Occupied' },
    { id: 5, flatNo: 'B-202', buildingName: 'Green Valley Apt', monthlyRent: 7500, depositAmount: 22500, status: 'Occupied' },
    { id: 6, flatNo: 'B-203', buildingName: 'Green Valley Apt', monthlyRent: 8000, depositAmount: 24000, status: 'Vacant' },
    { id: 7, flatNo: 'C-301', buildingName: 'Royal Heights', monthlyRent: 10000, depositAmount: 30000, status: 'Occupied' },
    { id: 8, flatNo: 'C-302', buildingName: 'Royal Heights', monthlyRent: 10500, depositAmount: 31500, status: 'Occupied' },
    { id: 9, flatNo: 'C-303', buildingName: 'Royal Heights', monthlyRent: 11000, depositAmount: 33000, status: 'Vacant' },
    { id: 10, flatNo: 'D-401', buildingName: 'Lakeside Tower', monthlyRent: 12000, depositAmount: 36000, status: 'Occupied' },
  ];

  // ── Renters ──
  private renters: Renter[] = [
    { id: 1, renterName: 'Rajesh Kumar', mobileNumber: '9876543210', flatId: 1, flatNo: 'A-101', buildingName: 'Sunshine Residency', joiningDate: '2024-01-15', monthlyRent: 8000, depositPaid: 24000, idProofNo: 'AADHAAR-1234-5678', status: 'Active' },
    { id: 2, renterName: 'Priya Sharma', mobileNumber: '9876543211', flatId: 2, flatNo: 'A-102', buildingName: 'Sunshine Residency', joiningDate: '2024-03-01', monthlyRent: 8500, depositPaid: 25500, idProofNo: 'PAN-ABCDE1234F', status: 'Active' },
    { id: 3, renterName: 'Amit Patel', mobileNumber: '9876543212', flatId: 4, flatNo: 'B-201', buildingName: 'Green Valley Apt', joiningDate: '2023-11-10', monthlyRent: 7500, depositPaid: 22500, idProofNo: 'AADHAAR-9876-5432', status: 'Active' },
    { id: 4, renterName: 'Sunita Devi', mobileNumber: '9876543213', flatId: 5, flatNo: 'B-202', buildingName: 'Green Valley Apt', joiningDate: '2024-02-20', monthlyRent: 7500, depositPaid: 22500, idProofNo: 'VOTER-ID-ABC123', status: 'Active' },
    { id: 5, renterName: 'Vikram Singh', mobileNumber: '9876543214', flatId: 7, flatNo: 'C-301', buildingName: 'Royal Heights', joiningDate: '2024-06-01', monthlyRent: 10000, depositPaid: 30000, idProofNo: 'PASSPORT-J1234567', status: 'Active' },
    { id: 6, renterName: 'Neha Gupta', mobileNumber: '9876543215', flatId: 8, flatNo: 'C-302', buildingName: 'Royal Heights', joiningDate: '2024-04-15', monthlyRent: 10500, depositPaid: 31500, idProofNo: 'DL-MH0120230012', status: 'Active' },
    { id: 7, renterName: 'Ramesh Yadav', mobileNumber: '9876543216', flatId: 10, flatNo: 'D-401', buildingName: 'Lakeside Tower', joiningDate: '2024-05-01', monthlyRent: 12000, depositPaid: 36000, idProofNo: 'AADHAAR-5555-6666', status: 'Active' },
    { id: 8, renterName: 'Kavita Mishra', mobileNumber: '9876543217', flatId: 3, flatNo: 'A-103', buildingName: 'Sunshine Residency', joiningDate: '2023-08-01', monthlyRent: 9000, depositPaid: 27000, idProofNo: 'PAN-XYZAB9876C', status: 'Left' },
  ];

  // ── Rent Payments ──
  private rentPayments: RentPayment[] = [
    { id: 1, renterId: 1, renterName: 'Rajesh Kumar', flatNo: 'A-101', month: 'June 2026', amountPaid: 8000, paymentDate: '2026-06-05', paymentMode: 'UPI', remark: 'On time' },
    { id: 2, renterId: 2, renterName: 'Priya Sharma', flatNo: 'A-102', month: 'June 2026', amountPaid: 8500, paymentDate: '2026-06-03', paymentMode: 'Bank', remark: '' },
    { id: 3, renterId: 3, renterName: 'Amit Patel', flatNo: 'B-201', month: 'June 2026', amountPaid: 7500, paymentDate: '2026-06-07', paymentMode: 'Cash', remark: '' },
    { id: 4, renterId: 5, renterName: 'Vikram Singh', flatNo: 'C-301', month: 'June 2026', amountPaid: 10000, paymentDate: '2026-06-01', paymentMode: 'UPI', remark: 'Paid early' },
    { id: 5, renterId: 6, renterName: 'Neha Gupta', flatNo: 'C-302', month: 'June 2026', amountPaid: 10500, paymentDate: '2026-06-04', paymentMode: 'Bank', remark: '' },
    { id: 6, renterId: 1, renterName: 'Rajesh Kumar', flatNo: 'A-101', month: 'May 2026', amountPaid: 8000, paymentDate: '2026-05-05', paymentMode: 'UPI', remark: '' },
    { id: 7, renterId: 2, renterName: 'Priya Sharma', flatNo: 'A-102', month: 'May 2026', amountPaid: 8500, paymentDate: '2026-05-02', paymentMode: 'Bank', remark: '' },
    { id: 8, renterId: 3, renterName: 'Amit Patel', flatNo: 'B-201', month: 'May 2026', amountPaid: 7500, paymentDate: '2026-05-08', paymentMode: 'Cash', remark: '' },
    { id: 9, renterId: 4, renterName: 'Sunita Devi', flatNo: 'B-202', month: 'May 2026', amountPaid: 7500, paymentDate: '2026-05-10', paymentMode: 'UPI', remark: '' },
    { id: 10, renterId: 5, renterName: 'Vikram Singh', flatNo: 'C-301', month: 'May 2026', amountPaid: 10000, paymentDate: '2026-05-01', paymentMode: 'UPI', remark: '' },
    { id: 11, renterId: 6, renterName: 'Neha Gupta', flatNo: 'C-302', month: 'May 2026', amountPaid: 10500, paymentDate: '2026-05-05', paymentMode: 'Bank', remark: '' },
    { id: 12, renterId: 7, renterName: 'Ramesh Yadav', flatNo: 'D-401', month: 'May 2026', amountPaid: 12000, paymentDate: '2026-05-03', paymentMode: 'UPI', remark: '' },
    { id: 13, renterId: 1, renterName: 'Rajesh Kumar', flatNo: 'A-101', month: 'April 2026', amountPaid: 8000, paymentDate: '2026-04-06', paymentMode: 'UPI', remark: '' },
    { id: 14, renterId: 2, renterName: 'Priya Sharma', flatNo: 'A-102', month: 'April 2026', amountPaid: 8500, paymentDate: '2026-04-04', paymentMode: 'Bank', remark: '' },
    { id: 15, renterId: 3, renterName: 'Amit Patel', flatNo: 'B-201', month: 'April 2026', amountPaid: 7500, paymentDate: '2026-04-09', paymentMode: 'Cash', remark: '' },
  ];

  // ── Pending Rents ──
  private pendingRents: PendingRent[] = [
    { id: 1, renterId: 4, renterName: 'Sunita Devi', flatNo: 'B-202', month: 'June 2026', monthlyRent: 7500, paidAmount: 0, pendingAmount: 7500, dueDate: '2026-06-05', status: 'Pending' },
    { id: 2, renterId: 7, renterName: 'Ramesh Yadav', flatNo: 'D-401', month: 'June 2026', monthlyRent: 12000, paidAmount: 5000, pendingAmount: 7000, dueDate: '2026-06-05', status: 'Partial' },
  ];

  // ── Settlements ──
  private settlements: Settlement[] = [
    { id: 1, renterId: 8, renterName: 'Kavita Mishra', flatNo: 'A-103', leavingDate: '2025-12-31', depositAmount: 27000, pendingRent: 9000, deductionAmount: 2000, deductionReason: 'Wall damage repair', finalRefundAmount: 16000, settlementDate: '2026-01-05' },
  ];

  // ── Auth ──
  private currentUser: User | null = null;
  private isLoggedIn$ = new BehaviorSubject<boolean>(false);

  // ────────── AUTH ──────────
  login(username: string, password: string): Observable<User | null> {
    if (username === 'admin' && password === 'admin123') {
      this.currentUser = { username: 'admin', name: 'Shubhangi Patel', role: 'Admin' };
      this.isLoggedIn$.next(true);
      return of(this.currentUser);
    }
    return of(null);
  }

  logout(): void {
    this.currentUser = null;
    this.isLoggedIn$.next(false);
  }

  getIsLoggedIn(): Observable<boolean> {
    return this.isLoggedIn$.asObservable();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setLoggedIn(val: boolean): void {
    this.isLoggedIn$.next(val);
    if (val && !this.currentUser) {
      this.currentUser = { username: 'admin', name: 'Shubhangi Patel', role: 'Admin' };
    }
  }

  // ────────── DASHBOARD ──────────
  getDashboardStats(): DashboardStats {
    const totalFlats = this.flats.length;
    const occupiedFlats = this.flats.filter(f => f.status === 'Occupied').length;
    const vacantFlats = this.flats.filter(f => f.status === 'Vacant').length;
    const activeRenters = this.renters.filter(r => r.status === 'Active');
    const currentMonthRent = activeRenters.reduce((s, r) => s + r.monthlyRent, 0);
    const junePayments = this.rentPayments.filter(p => p.month === 'June 2026');
    const collectedAmount = junePayments.reduce((s, p) => s + p.amountPaid, 0);
    const pendingAmount = currentMonthRent - collectedAmount;
    return {
      totalFlats,
      occupiedFlats,
      vacantFlats,
      currentMonthRent,
      collectedAmount,
      pendingAmount: pendingAmount > 0 ? pendingAmount : 0,
      totalActiveRenters: activeRenters.length,
    };
  }

  // ────────── FLATS ──────────
  getFlats(): Flat[] {
    return [...this.flats];
  }

  addFlat(flat: Omit<Flat, 'id'>): Flat {
    const newFlat: Flat = { ...flat, id: this.flats.length + 1 };
    this.flats.push(newFlat);
    return newFlat;
  }

  updateFlat(flat: Flat): void {
    const idx = this.flats.findIndex(f => f.id === flat.id);
    if (idx !== -1) this.flats[idx] = { ...flat };
  }

  deleteFlat(id: number): void {
    this.flats = this.flats.filter(f => f.id !== id);
  }

  getVacantFlats(): Flat[] {
    return this.flats.filter(f => f.status === 'Vacant');
  }

  // ────────── RENTERS ──────────
  getRenters(): Renter[] {
    return [...this.renters];
  }

  getActiveRenters(): Renter[] {
    return this.renters.filter(r => r.status === 'Active');
  }

  addRenter(renter: Omit<Renter, 'id'>): Renter {
    const newRenter: Renter = { ...renter, id: this.renters.length + 1 };
    this.renters.push(newRenter);
    // Mark flat as occupied
    const flat = this.flats.find(f => f.id === newRenter.flatId);
    if (flat) flat.status = 'Occupied';
    return newRenter;
  }

  updateRenter(renter: Renter): void {
    const idx = this.renters.findIndex(r => r.id === renter.id);
    if (idx !== -1) this.renters[idx] = { ...renter };
  }

  deleteRenter(id: number): void {
    const renter = this.renters.find(r => r.id === id);
    if (renter) {
      const flat = this.flats.find(f => f.id === renter.flatId);
      if (flat) flat.status = 'Vacant';
    }
    this.renters = this.renters.filter(r => r.id !== id);
  }

  getRenterById(id: number): Renter | undefined {
    return this.renters.find(r => r.id === id);
  }

  searchRenters(query: string): Renter[] {
    const q = query.toLowerCase();
    return this.renters.filter(r =>
      r.renterName.toLowerCase().includes(q) ||
      r.mobileNumber.includes(q) ||
      r.flatNo.toLowerCase().includes(q)
    );
  }

  // ────────── PAYMENTS ──────────
  getRentPayments(): RentPayment[] {
    return [...this.rentPayments];
  }

  getPaymentsByRenter(renterId: number): RentPayment[] {
    return this.rentPayments.filter(p => p.renterId === renterId);
  }

  addPayment(payment: Omit<RentPayment, 'id'>): RentPayment {
    const newPayment: RentPayment = { ...payment, id: this.rentPayments.length + 1 };
    this.rentPayments.push(newPayment);
    return newPayment;
  }

  // ────────── PENDING RENTS ──────────
  getPendingRents(): PendingRent[] {
    return [...this.pendingRents];
  }

  // ────────── SETTLEMENTS ──────────
  getSettlements(): Settlement[] {
    return [...this.settlements];
  }

  addSettlement(settlement: Omit<Settlement, 'id'>): Settlement {
    const newSettlement: Settlement = { ...settlement, id: this.settlements.length + 1 };
    this.settlements.push(newSettlement);
    // Mark renter as Left
    const renter = this.renters.find(r => r.id === newSettlement.renterId);
    if (renter) {
      renter.status = 'Left';
      const flat = this.flats.find(f => f.id === renter.flatId);
      if (flat) flat.status = 'Vacant';
    }
    return newSettlement;
  }
}
