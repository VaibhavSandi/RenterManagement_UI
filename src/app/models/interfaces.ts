export interface Flat {
  id: number;
  flatNo: string;
  buildingName: string;
  monthlyRent: number;
  depositAmount: number;
  status: 'Vacant' | 'Occupied';
}

export interface Renter {
  id: number;
  renterName: string;
  mobileNumber: string;
  flatId: number;
  flatNo: string;
  buildingName: string;
  joiningDate: string;
  monthlyRent: number;
  depositPaid: number;
  idProofNo: string;
  status: 'Active' | 'Left';
}

export interface RentPayment {
  id: number;
  renterId: number;
  renterName: string;
  flatNo: string;
  month: string;
  amountPaid: number;
  paymentDate: string;
  paymentMode: 'Cash' | 'UPI' | 'Bank';
  remark: string;
}

export interface PendingRent {
  id: number;
  renterId: number;
  renterName: string;
  flatNo: string;
  month: string;
  monthlyRent: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate: string;
  status: 'Pending' | 'Partial' | 'Paid';
}

export interface Settlement {
  id: number;
  renterId: number;
  renterName: string;
  flatNo: string;
  leavingDate: string;
  depositAmount: number;
  pendingRent: number;
  deductionAmount: number;
  deductionReason: string;
  finalRefundAmount: number;
  settlementDate: string;
}

export interface MonthlyLedgerEntry {
  month: string;           // e.g. "January 2024"
  monthKey: string;        // YYYY-MM for sorting
  expectedRent: number;
  amountPaid: number;
  pendingAmount: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  paymentDate?: string;
  paymentMode?: string;
  remark?: string;
}

export interface DashboardStats {
  totalFlats: number;
  occupiedFlats: number;
  vacantFlats: number;
  currentMonthRent: number;
  collectedAmount: number;
  pendingAmount: number;
  totalActiveRenters: number;
}

export interface User {
  username: string;
  name: string;
  role: string;
}
