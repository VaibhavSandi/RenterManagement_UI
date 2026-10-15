export interface Expense {
  expenseId?: number;
  description: string;
  amount: number;
  expenseDate: string;
  category: string;
  flatId?: number | null;
  flatNo?: string;
}
