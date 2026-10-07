const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export const depositApi = async (accountNumber: number, amount: number) => {
  const response = await fetch(
    `${API_BASE}/transactions/${accountNumber}/deposit`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Deposit failed.');
  return data;
};

export const withdrawApi = async (accountNumber: number, amount: number) => {
  const response = await fetch(
    `${API_BASE}/transactions/${accountNumber}/withdraw`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Withdrawal failed.');
  return data;
};