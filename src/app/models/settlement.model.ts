  
  export interface Settlement {
   settlementId: number;

     renterId?:number;
     renterName: string;

    flatId: number;
    flatNo: string;

    leavingDate: Date;
    depositAmount: number;
    pendingRent: number;
    deductionAmount: number;
    deductionReason: string;
    finalRefundAmount: number;

  }