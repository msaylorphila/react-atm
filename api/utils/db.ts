import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = async (queryText: string, values: any[] = []): Promise<pg.QueryResult<any>> => {
  const client = await pool.connect();
  try { 
    return await client.query(queryText, values);
  } finally {
    client.release();
  }
};

export const executeWithTransaction = async <T>(
  callback: (executeQuery: (text: string, values?: any[]) => Promise<pg.QueryResult<any>>) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const executeQuery = (text: string, values: any[] = []) => client.query(text, values);
    const result = await callback(executeQuery);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};