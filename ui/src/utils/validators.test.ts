import { describe, expect, it } from '@jest/globals';

import { TRANSACTION_LIMITS } from '../config/transactionLimits';
import { validateDeposit, validateWithdrawal } from './validators';
import { account } from '../Types/Account';

describe('validators', () => {
  it('rejects withdrawals over the per-transaction limit', () => {
    const account: account = {
      accountNumber: 1,
      name: 'Checking User',
      amount: 500,
      type: 'checking',
      creditLimit: 0,
      dailyWithdrawn: 0,
    };

    expect(
      validateWithdrawal(
        account,
        TRANSACTION_LIMITS.MAX_WITHDRAWAL_PER_TRANSACTION + 5,
      ),
    ).toBe(
      `Withdrawal limit exceeded. Maximum withdrawal is up to $${TRANSACTION_LIMITS.MAX_WITHDRAWAL_PER_TRANSACTION} in one transaction.`,
    );
  });

  it('rejects withdrawals that are not multiples of five', () => {
    const account: account = {
      accountNumber: 1,
      name: 'Checking User',
      amount: 500,
      type: 'checking',
      creditLimit: 0,
      dailyWithdrawn: 0,
    };

    expect(validateWithdrawal(account, 13)).toBe(
      'Withdrawals must be in multiples of 5.',
    );
  });

  it('rejects withdrawals that exceed the daily allowance', () => {
    const account: account = {
      accountNumber: 1,
      name: 'Checking User',
      amount: 500,
      type: 'checking',
      creditLimit: 0,
      dailyWithdrawn: 350,
    };

    expect(validateWithdrawal(account, 75)).toBe(
      `Daily withdrawal limit of $${TRANSACTION_LIMITS.MAX_DAILY_WITHDRAWAL} exceeded. You have $${TRANSACTION_LIMITS.MAX_DAILY_WITHDRAWAL - 350} left to withdraw today.`,
    );
  });

  it('rejects withdrawals that exceed a checking account balance', () => {
    const account: account = {
      accountNumber: 1,
      name: 'Checking User',
      amount: 100,
      type: 'checking',
      creditLimit: 0,
      dailyWithdrawn: 0,
    };

    expect(validateWithdrawal(account, 105)).toBe(
      'Insufficient funds. Cannot withdraw this amount.',
    );
  });

  it('rejects withdrawals that would exceed a credit account limit', () => {
    const account: account = {
      accountNumber: 2,
      name: 'Credit User',
      amount: -2000,
      type: 'credit',
      creditLimit: 1500,
      dailyWithdrawn: 0,
    };

    expect(validateWithdrawal(account, 200)).toBe(
      'Credit limit of $1500 exceeded. You have $0 left to withdraw before hitting your credit limit.',
    );
  });

  it('rejects withdrawals when a credit account has no configured limit', () => {
    const account: account = {
      accountNumber: 2,
      name: 'Credit User',
      amount: -500,
      type: 'credit',
      creditLimit: null,
      dailyWithdrawn: 0,
    };

    expect(validateWithdrawal(account, 50)).toBe(
      'Credit account is missing a credit limit.',
    );
  });

  it('accepts valid withdrawal requests', () => {
    const account: account = {
      accountNumber: 1,
      name: 'Checking User',
      amount: 500,
      type: 'checking',
      creditLimit: 0,
      dailyWithdrawn: 100,
    };

    expect(validateWithdrawal(account, 50)).toBeNull();
  });

  it('rejects deposits above the single-transaction cap', () => {
    const account: account = {
      accountNumber: 1,
      name: 'Checking User',
      amount: 500,
      type: 'checking',
      creditLimit: 0,
      dailyWithdrawn: 0,
    };

    expect(
      validateDeposit(
        account,
        TRANSACTION_LIMITS.MAX_DEPOSIT_PER_TRANSACTION + 1,
      ),
    ).toBe(
      `Deposit limit exceeded. Maximum deposit is $${TRANSACTION_LIMITS.MAX_DEPOSIT_PER_TRANSACTION} per transaction.`,
    );
  });

  it('rejects deposits that would move a credit account above zero', () => {
    const account: account = {
      accountNumber: 2,
      name: 'Credit User',
      amount: -500,
      type: 'credit',
      creditLimit: 1000,
      dailyWithdrawn: 0,
    };

    expect(validateDeposit(account, 600)).toBe(
      'Cannot deposit more than amount needed to 0 out the credit account.',
    );
  });

  it('accepts valid deposit requests', () => {
    const account: account = {
      accountNumber: 1,
      name: 'Checking User',
      amount: 500,
      type: 'checking',
      creditLimit: 0,
      dailyWithdrawn: 0,
    };

    expect(validateDeposit(account, 250)).toBeNull();
  });

  it('rejects deposits when a credit account has no configured limit', () => {
    const account: account = {
      accountNumber: 2,
      name: 'Credit User',
      amount: -500,
      type: 'credit',
      creditLimit: null,
      dailyWithdrawn: 0,
    };

    expect(validateDeposit(account, 100)).toBe(
      'Credit account is missing a credit limit.',
    );
  });
});