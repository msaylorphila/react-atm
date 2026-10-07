# How to Test

1. **Sign-In: Invalid Account**
   * *Action:* Attempt to sign in using a non-existent account number (`13`).
   * *Result:* An error is displayed cleanly as an inline UI alert on screen, rather than a native browser alert.

2. **Sign-In: Malformed Input Guard**
   * *Action:* Type `1-` into the account login field.
   * *Result:* The trailing minus sign is prevented from populating.

3. **Sign-In: Valid Account**
   * *Action:* Sign in using account `1` (John Checking).
   * *Result:* Successful login and dashboard load.

4. **Withdrawals: Single Transaction Limit ($205)**
   * *Action:* Attempt to withdraw `$205`.
   * *Result:* Blocked due to the single transaction limit error.

5. **Withdrawals: Bill Increment Rule ($199)**
   * *Action:* Attempt to withdraw `$199`.
   * *Result:* Blocked due to the multiple-of-five requirement.

6. **Withdrawals: First Valid Transaction ($200)**
   * *Action:* Attempt to withdraw `$200`.
   * *Result:* Success.

7. **Withdrawals: Second Valid Transaction ($200)**
   * *Action:* Attempt to withdraw `$200` again.
   * *Result:* Success (totaling `$400` for the day).

8. **Withdrawals: Daily Limit Exceeded ($10 via Spinner)**
   * *Action:* Use the input spinner arrow to set a withdrawal of `$10`.
   * *Result:* Blocked due to hitting the daily limit cap.

9. **Deposits: Single Transaction Limit ($10,000)**
   * *Action:* Attempt to deposit `$10,000`.
   * *Result:* Blocked due to the single transaction deposit limit.

10. **Deposits: Valid Transaction ($1,000)**
    * *Action:* Deposit `$1,000`.
    * *Result:* Success.

11. **Switch Account: Alex Checking**
    * *Action:* Sign out and log in as Alex checking account (Account ID `10`).
    * *Result:* Successful login.

12. **Deposits: Small Valid Amount ($1)**
    * *Action:* Deposit `$1`.
    * *Result:* Success.

13. **Withdrawals: Over Single Limit ($255)**
    * *Action:* Attempt to withdraw `$255`.
    * *Result:* Blocked due to the transaction limit.

14. **Withdrawals: Valid Amount ($200)**
    * *Action:* Withdraw `$200`.
    * *Result:* Success.

15. **Withdrawals: Insufficient Funds ($100)**
    * *Action:* Attempt to withdraw `$100`.
    * *Result:* Blocked due to insufficient funds.

16. **Withdrawals: Valid Amount ($55)**
    * *Action:* Withdraw `$55`.
    * *Result:* Success.

17. **Switch Account: Bill's Credit**
    * *Action:* Sign out and log in as Bill's credit account (Account ID `6`).
    * *Result:* Successful login.

18. **Withdrawals: Credit Limit Boundary ($5)**
    * *Action:* Attempt to withdraw `$5`.
    * *Result:* Blocked due to hitting the credit limit boundary.

19. **Deposits: Valid Amount ($1,000)**
    * *Action:* Deposit `$1,000` to clear credit balance.
    * *Result:* Success.

20. **Withdrawals: Valid Post-Deposit ($5)**
    * *Action:* Withdraw `$5`.
    * *Result:* Success.

21. **Withdrawals: Daily Limit Exceeded ($400)**
    * *Action:* Attempt to withdraw `$400`.
    * *Result:* Blocked due to daily limit.

22. **Withdrawals: Cumulative Daily Limit Sequence**
    * *Action:* Withdraw `$5` (Success) $\rightarrow$ Withdraw `$200` (Success) $\rightarrow$ Withdraw `$200` again.
    * *Result:* The final `$200` attempt fails due to exceeding the daily limit.

23. **Switch Account: Jill's Credit**
    * *Action:* Sign out and log in as Jill's credit account (Account ID `3`).
    * *Result:* Successful login.

24. **Deposits: Repeated Max Deposits ($1,000 x3)**
    * *Action:* Deposit `$1,000` three sequential times.
    * *Result:* Success every time.

25. **Deposits: Over-Zero Credit Ceiling ($5)**
    * *Action:* Attempt to deposit `$5` when the balance is already at `$0`.
    * *Result:* Blocked (cannot go over a balance of `0` on a credit account).