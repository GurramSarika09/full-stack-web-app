export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  expense_date: string; // YYYY-MM-DD
  notes: string | null;
  created_at: string;
}

export type ExpenseInput = Omit<Expense, 'id' | 'created_at'>;

export interface ExpenseFilters {
  category?: string;
  start?: string;
  end?: string;
}

export interface Summary {
  total: number;
  count: number;
  by_category: { category: string; total: number }[];
}

export const CATEGORIES = [
  'Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Other',
];
