import { query as defaultQuery } from "../utils/db";
import pg from 'pg';

export const getAccount = async (
  accountID: string,
  executeQuery: (text: string, values?: any[]) => Promise<pg.QueryResult<any>> = defaultQuery,
  forUpdate: boolean = false
) => {
  const res = await executeQuery(
    `
    SELECT account_number, name, amount, type, credit_limit 
    FROM accounts 
    WHERE account_number = $1
    ${forUpdate ? "FOR UPDATE" : ""}`,
    [accountID]
  );

  if (res.rowCount === 0) throw new Error("Account not found");

  return res.rows[0];
};