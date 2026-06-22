export interface RentPayment {

  paymentId?: number;

  renterId: number;
  renterName?: string;

  flatId: number;
  flatNo?: string;

  rentMonth: number;
  rentYear: number;

  monthlyRent: number;
  amountPaid: number;

  pendingAmount?: number;

  paymentMode?: string;
  remark?: string;

  paymentDate?: string;
}