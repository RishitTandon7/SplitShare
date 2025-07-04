import { create } from 'zustand';

export interface ExpenseMember {
  id: string;
  name: string;
  avatar?: string;
  amount: number;
  paid: boolean;
}

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  paidBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  date: Date;
  splitWith: ExpenseMember[];
  category: string;
  notes?: string;
}

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updatedExpense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getGroupExpenses: (groupId: string) => Expense[];
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  isLoading: false,
  error: null,
  
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
  updateExpense: (id, updatedExpense) => 
    set((state) => ({
      expenses: state.expenses.map((expense) => 
        expense.id === id ? { ...expense, ...updatedExpense } : expense
      ),
    })),
  deleteExpense: (id) => 
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== id),
    })),
  getGroupExpenses: (groupId) => {
    return get().expenses.filter((expense) => expense.groupId === groupId);
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));