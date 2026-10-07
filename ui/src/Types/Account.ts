export type account = {
  accountNumber: number;
  name: string;
  amount: number;
  type: 'checking' | 'savings' | 'credit';
  creditLimit: number | null;
  dailyWithdrawn: number;
};