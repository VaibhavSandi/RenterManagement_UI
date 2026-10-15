// Rent position of one renter for one rent month (the month the rent is FOR,
// independent of the payment date). Calculated by the backend.
export interface RentMonthStatus {
  renterId: number;
  renterName: string;
  email?: string;
  flatNo?: string;

  rentMonth: number;
  rentYear: number;
  rentPeriod: string;
  dueDate?: string;

  rentAmount: number;
  paidAmount: number;
  pendingAmount: number;
  creditAmount: number;

  status: 'Paid' | 'Partial' | 'Pending';

  paymentCount: number;
  paymentDates: string[];
  lastPaymentDate?: string;
  paymentModes?: string;
}

export interface RenterPendingSummary {
  renterId: number;
  renterName: string;
  email?: string;
  mobileNumber?: string;
  flatNo?: string;
  monthlyRent: number;
  asOfRentMonth: number;
  asOfRentYear: number;
  pendingMonths: RentMonthStatus[];
  pendingMonthCount: number;
  totalPending: number;
  totalCredit: number;
}

export interface DueMonth {
  rentMonth: number;
  rentYear: number;
}
