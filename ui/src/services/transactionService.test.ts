import { describe, expect, it, jest, afterEach, beforeEach } from '@jest/globals';
import { TRANSACTION_LIMITS } from '../config/transactionLimits';
import { depositApi, withdrawApi } from './transactionService';

describe('transactionService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  const mockFetchResponse = (data: any, ok: boolean = true) => {
    (global.fetch as any).mockResolvedValue({
      ok,
      json: async () => data,
    });
  };

  it('throws the API error for a failed deposit request', async () => {
    mockFetchResponse({
      error: `Deposit limit exceeded. Maximum deposit is $${TRANSACTION_LIMITS.MAX_DEPOSIT_PER_TRANSACTION} per transaction.`,
    }, false);

    await expect(depositApi(3, 1500)).rejects.toThrow(
      `Deposit limit exceeded. Maximum deposit is $${TRANSACTION_LIMITS.MAX_DEPOSIT_PER_TRANSACTION} per transaction.`,
    );
  });

  it('returns parsed deposit data when the API succeeds', async () => {
    mockFetchResponse({
        account_number: 3,
        amount: 150,
        type: 'credit',
    });

    await expect(depositApi(3, 150)).resolves.toEqual({
      account_number: 3,
      amount: 150,
      type: 'credit',
    });
  });

  it('throws the API error for a failed withdrawal request', async () => {
    mockFetchResponse({
        error: `Daily withdrawal limit exceeded. Maximum daily withdrawal is $${TRANSACTION_LIMITS.MAX_DAILY_WITHDRAWAL}.`,
    }, false);

    await expect(withdrawApi(3, 500)).rejects.toThrow(
      `Daily withdrawal limit exceeded. Maximum daily withdrawal is $${TRANSACTION_LIMITS.MAX_DAILY_WITHDRAWAL}.`,
    );
  });

  it('returns parsed withdrawal data when the API succeeds', async () => {
    mockFetchResponse({
        account_number: 3,
        amount: 200,
        type: 'credit',
        dailyWithdrawn: 200,
    });

    await expect(withdrawApi(3, 200)).resolves.toEqual({
      account_number: 3,
      amount: 200,
      type: 'credit',
      dailyWithdrawn: 200,
    });
  });
});