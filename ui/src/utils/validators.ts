import { account } from '../Types/Account';
import { TRANSACTION_LIMITS } from '../config/transactionLimits';

export const validateWithdrawal = (
  account: account,
  withdrawAmount: number,
): string | null => {
  if (withdrawAmount % TRANSACTION_LIMITS.WITHDRAWAL_MULTIPLE !== 0) return 'Withdrawals must be in multiples of 5.';
  if (withdrawAmount > TRANSACTION_LIMITS.MAX_WITHDRAWAL_PER_TRANSACTION) return `Withdrawal limit exceeded. Maximum withdrawal is up to $${TRANSACTION_LIMITS.MAX_WITHDRAWAL_PER_TRANSACTION} in one transaction.`;
  if (account.type === 'credit' && account.creditLimit == null) return 'Credit account is missing a credit limit.';
  
  const availableFunds = account.type === 'checking'
    ? account.amount
    : account.creditLimit! - Math.abs(account.amount);

  if (withdrawAmount > availableFunds) {
    return account.type === 'checking'
      ? 'Insufficient funds. Cannot withdraw this amount.'
      : `Credit limit of $${account.creditLimit} exceeded. You have $${Math.max(0, availableFunds)} left to withdraw before hitting your credit limit.`;
  }

  const currentDailyWithdrawn = account.dailyWithdrawn || 0;
  if (currentDailyWithdrawn + withdrawAmount > TRANSACTION_LIMITS.MAX_DAILY_WITHDRAWAL) {
    const dailyRemaining = Math.max(0, TRANSACTION_LIMITS.MAX_DAILY_WITHDRAWAL - currentDailyWithdrawn);
    const trueRemaining = Math.min(dailyRemaining, availableFunds);
    
    return `Daily withdrawal limit of $${TRANSACTION_LIMITS.MAX_DAILY_WITHDRAWAL} exceeded. You have $${trueRemaining} left to withdraw today.`;
  }

  return null;
};

export const validateDeposit = (
  account: account,
  depositAmount: number,
): string | null => {
  const newBalance = account.amount + depositAmount;
  const creditBalanceAboveZero = account.type === 'credit' && newBalance > 0;
  const maxDepositTransactionExceeded = depositAmount > TRANSACTION_LIMITS.MAX_DEPOSIT_PER_TRANSACTION;
  const creditLimitNotConfigured = account.type === 'credit' && account.creditLimit == null;

  if (creditBalanceAboveZero)return 'Cannot deposit more than amount needed to 0 out the credit account.';
  if (maxDepositTransactionExceeded) return `Deposit limit exceeded. Maximum deposit is $${TRANSACTION_LIMITS.MAX_DEPOSIT_PER_TRANSACTION} per transaction.`;
  if (creditLimitNotConfigured) return 'Credit account is missing a credit limit.';
  
  return null;
};