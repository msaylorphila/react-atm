import test from 'node:test';
import assert from 'node:assert/strict';

import * as db from '../utils/db';
import { TRANSACTION_LIMITS } from '../config/transactionLimits';
import { deposit, getDailyWithdrawalTotal, withdrawal } from './transactionHandler';

const withClient = (client: any) => {
  const originalConnect = (db.pool as any).connect;
  (db.pool as any).connect = async () => client;

  return () => {
    (db.pool as any).connect = originalConnect;
  };
};

const withQuery = (stub: any) => {
  const originalQuery = (db as any).query;
  (db as any).query = stub;

  return () => {
    (db as any).query = originalQuery;
  };
};

const makeClient = (account: any, dailyTotal = 0) => ({
  query: async (sql: string) => {
    const statement = sql.trim().toLowerCase();

    if (statement.startsWith('begin') || statement.startsWith('commit') || statement.startsWith('rollback')) {
      return { rows: [] };
    }

    if (statement.includes('sum(amount)') && statement.includes('daily_total')) {
      return {
        rows: [{ daily_total: String(dailyTotal) }],
      };
    }

    if (statement.includes('from accounts')) {
      return account
        ? { rowCount: 1, rows: [account] }
        : { rowCount: 0, rows: [] };
    }

    if (statement.includes('update accounts')) {
      return { rowCount: 1 };
    }

    if (statement.includes('insert into transactions')) {
      return { rowCount: 1 };
    }

    throw new Error(`Unexpected SQL in test: ${sql}`);
  },
  release: () => undefined,
});

test('getDailyWithdrawalTotal returns the numeric sum for withdrawals today', async () => {
  const restoreQuery = withQuery(async () => ({ rows: [{ daily_total: '125' }] }));

  try {
    const result = await getDailyWithdrawalTotal('100');
    assert.equal(result, 125);
  } finally {
    restoreQuery();
  }
});

test('withdrawal rejects amounts over the per-transaction limit', async () => {
  await assert.rejects(
    () => withdrawal('100', TRANSACTION_LIMITS.MAX_WITHDRAWAL_PER_TRANSACTION + 5),
    new RegExp(`Withdrawal limit exceeded\\. Maximum withdrawal is up to \\$${TRANSACTION_LIMITS.MAX_WITHDRAWAL_PER_TRANSACTION} in one transaction\\.`)
  );
});

test('withdrawal rejects when the total for the day would exceed $400', async () => {
  const restoreConnect = withClient(makeClient({ account_number: '100', amount: 1000, type: 'checking', credit_limit: null }, 350));

  try {
    await assert.rejects(
      () => withdrawal('100', 75),
      new RegExp(`Daily withdrawal limit of \\$${TRANSACTION_LIMITS.MAX_DAILY_WITHDRAWAL} exceeded\\. You have \\$.* left to withdraw today\\.`)
    );
  } finally {
    restoreConnect();
  }
});

test('withdrawal rejects when the account does not exist', async () => {
  const restoreConnect = withClient(makeClient(null, 0));

  try {
    await assert.rejects(
      () => withdrawal('404', 20),
      /Account not found/
    );
  } finally {
    restoreConnect();
  }
});

test('withdrawal rejects when a checking account has insufficient funds', async () => {
  const restoreConnect = withClient(makeClient({ account_number: '100', amount: 40, type: 'checking', credit_limit: null }, 0));

  try {
    await assert.rejects(
      () => withdrawal('100', 45),
      /Insufficient funds\. Cannot withdraw this amount\./
    );
  } finally {
    restoreConnect();
  }
});

test('withdrawal rejects when a credit account exceeds its credit limit', async () => {
  const restoreConnect = withClient(makeClient({ account_number: '200', amount: -2000, type: 'credit', credit_limit: 1200 }, 0));

  try {
    await assert.rejects(
      () => withdrawal('200', 200),
      /Credit limit of \$1200 exceeded\. You have \$0 left to withdraw before hitting your credit limit\./
    );
  } finally {
    restoreConnect();
  }
});

test('withdrawal rejects when a credit account has no credit limit configured', async () => {
  const restoreConnect = withClient(makeClient({ account_number: '200', amount: -500, type: 'credit', credit_limit: null }, 0));

  try {
    await assert.rejects(
      () => withdrawal('200', 50),
      /Credit account is missing a credit limit\./
    );
  } finally {
    restoreConnect();
  }
});

test('deposit rejects when a credit account has no credit limit configured', async () => {
  const restoreConnect = withClient(makeClient({ account_number: '200', amount: -500, type: 'credit', credit_limit: null }, 0));

  try {
    await assert.rejects(
      () => deposit('200', 100),
      /Credit account is missing a credit limit\./
    );
  } finally {
    restoreConnect();
  }
});

test('withdrawal succeeds for a checking account and updates balance and daily total', async () => {
  const account = { account_number: '100', amount: 500, type: 'checking', credit_limit: null };
  const restoreConnect = withClient(makeClient(account, 150));

  try {
    const result = await withdrawal('100', 50);
    assert.equal(result.amount, 450);
    assert.equal(result.dailyWithdrawn, 200);
  } finally {
    restoreConnect();
  }
});

test('deposit rejects amounts above the per-transaction limit', async () => {
  await assert.rejects(
    () => deposit('100', TRANSACTION_LIMITS.MAX_DEPOSIT_PER_TRANSACTION + 1),
    new RegExp(`Deposit limit exceeded\\. Maximum deposit is \\$${TRANSACTION_LIMITS.MAX_DEPOSIT_PER_TRANSACTION} per transaction\\.`)
  );
});

test('deposit rejects a credit account deposit that would put it above zero', async () => {
  const restoreConnect = withClient(makeClient({ account_number: '200', amount: -500, type: 'credit', credit_limit: 1000 }, 0));

  try {
    await assert.rejects(
      () => deposit('200', 600),
      /Cannot deposit more than amount needed to 0 out the credit account\./
    );
  } finally {
    restoreConnect();
  }
});

test('deposit succeeds for a checking account and updates the balance', async () => {
  const account = { account_number: '100', amount: 500, type: 'checking', credit_limit: null };
  const restoreConnect = withClient(makeClient(account, 0));

  try {
    const result = await deposit('100', 125);
    assert.equal(result.amount, 625);
  } finally {
    restoreConnect();
  }
});