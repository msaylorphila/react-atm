import pg from 'pg';
import { query, executeWithTransaction } from '../utils/db';
import { TRANSACTION_LIMITS } from '../config/transactionLimits';
import { getAccount } from './accountHandler';

const getRemainingDailyWithdrawal = (dailyTotal: number) =>
  Math.max(0, TRANSACTION_LIMITS.MAX_DAILY_WITHDRAWAL - dailyTotal);

const getRemainingCreditAllowance = (account: {
  amount: number;
  credit_limit: number | null;
}) => {
  if (account.credit_limit == null) return 0;

  const currentDebt = Math.max(0, Math.abs(account.amount));
  return Math.max(0, account.credit_limit - currentDebt);
};

const persistTransaction = async (
  executeQuery: any,
  accountID: string,
  newBalance: number,
  transaction_type: 'deposit' | 'withdrawal',
  amount: number
) => {
  const updateRes = await executeQuery(
    `UPDATE accounts SET amount = $1 WHERE account_number = $2`,
    [newBalance, accountID]
  );

  if (updateRes.rowCount === 0) throw new Error('Transaction failed');

  await executeQuery(
    `INSERT INTO transactions (account_number, amount, transaction_type) VALUES ($1, $2, $3)`,
    [accountID, amount, transaction_type]
  );
}

const DAILY_WITHDRAWAL_QUERY = `
  SELECT COALESCE(SUM(amount), 0) as daily_total
  FROM transactions
  WHERE account_number = $1 AND transaction_type = 'withdrawal' AND created_at >= CURRENT_DATE::timestamptz
`;

export const getDailyWithdrawalTotal = async (
  accountID: string,
  executeQuery: (text: string, values?: any[]) => Promise<pg.QueryResult<any>> = query
) => {
  const res = await executeQuery(DAILY_WITHDRAWAL_QUERY, [accountID]);
  return Number(res.rows[0].daily_total);
};

export const withdrawal = async (accountID: string, amount: number) => {
  if (amount % TRANSACTION_LIMITS.WITHDRAWAL_MULTIPLE !== 0) throw new Error('Withdrawals must be in multiples of 5.');
  if (amount > TRANSACTION_LIMITS.MAX_WITHDRAWAL_PER_TRANSACTION) throw new Error(`Withdrawal limit exceeded. Maximum withdrawal is up to $${TRANSACTION_LIMITS.MAX_WITHDRAWAL_PER_TRANSACTION} in one transaction.`)

  return executeWithTransaction(async (executeQuery) => {
    const currentDailyTotal = await getDailyWithdrawalTotal(accountID, executeQuery);
    const newDailyTotal = currentDailyTotal + amount;
    const account = await getAccount(accountID, executeQuery, true);
    const newBalance = account.amount - amount;

    if (account.type === 'credit') {
      if (account.credit_limit == null) throw new Error('Credit account is missing a credit limit.')
      if (Math.abs(newBalance) > account.credit_limit) {
        const remaining = getRemainingCreditAllowance(account);
        throw new Error(
          `Credit limit of $${account.credit_limit} exceeded. You have $${remaining} left to withdraw before hitting your credit limit.`,
        );
      }
    } else {
      if (newBalance < 0) throw new Error('Insufficient funds. Cannot withdraw this amount.');
    }

    if (newDailyTotal > TRANSACTION_LIMITS.MAX_DAILY_WITHDRAWAL) {
      const remaining = getRemainingDailyWithdrawal(currentDailyTotal);
      throw new Error(
        `Daily withdrawal limit of $${TRANSACTION_LIMITS.MAX_DAILY_WITHDRAWAL} exceeded. You have $${remaining} left to withdraw today.`,
      );
    }
    account.amount = newBalance;

    await persistTransaction(executeQuery, accountID, account.amount, 'withdrawal', amount);

    account.dailyWithdrawn = newDailyTotal;
    return account;
  })
};

export const deposit = async (accountID: string, amount: number) => {
  if (amount > TRANSACTION_LIMITS.MAX_DEPOSIT_PER_TRANSACTION) throw new Error(`Deposit limit exceeded. Maximum deposit is $${TRANSACTION_LIMITS.MAX_DEPOSIT_PER_TRANSACTION} per transaction.`);

  return executeWithTransaction(async (executeQuery) => {
    const account = await getAccount(accountID, executeQuery, true);
    
    if (account.type === 'credit' && account.credit_limit == null) throw new Error('Credit account is missing a credit limit.');

    const newBalance = account.amount + amount;

    if (account.type === 'credit' && newBalance > 0) throw new Error('Cannot deposit more than amount needed to 0 out the credit account.');

    account.amount = newBalance;

    await persistTransaction(executeQuery, accountID, account.amount, 'deposit', amount);

    return account;
  })
};