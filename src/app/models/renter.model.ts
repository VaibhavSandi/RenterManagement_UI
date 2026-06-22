export interface Renter {
  renterId?: number;
  renterName: string;
  mobileNumber: string;
  idProofNo: string;
  flatId: number | null;
  flatNo?: string;
  joiningDate: string;
  monthlyRent: number;
  depositPaid: number;
  status: string;
}