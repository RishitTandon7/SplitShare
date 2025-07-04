import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const calculateBalances = (expenses: any[], userId: string) => {
  // This is a simplified balance calculation
  // In a real app, this would be more complex to handle various scenarios
  
  let totalOwed = 0;
  let totalOwing = 0;
  
  expenses.forEach(expense => {
    // If user paid for this expense
    if (expense.paidBy.id === userId) {
      // Sum amounts owed to user by others
      expense.splitWith.forEach((member: any) => {
        if (member.id !== userId && !member.paid) {
          totalOwed += member.amount;
        }
      });
    } else {
      // Find if user owes anything
      const userSplit = expense.splitWith.find((member: any) => member.id === userId);
      if (userSplit && !userSplit.paid) {
        totalOwing += userSplit.amount;
      }
    }
  });
  
  return {
    totalOwed,
    totalOwing,
    netBalance: totalOwed - totalOwing
  };
};