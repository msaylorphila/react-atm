import { useState } from 'react';
import './App.css';
import { Grid } from '@mui/material';
import { SignIn } from './components/SignIn';
import { AccountDashboard } from './components/AccountDashboard';
import { account } from './Types/Account';

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

export const App = () => {
  const [accountNumberError, setAccountNumberError] = useState(false);
  const [accountNumberErrorMessage, setAccountNumberErrorMessage] = useState('');
  const [account, setAccount] = useState<account | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (accountNumber: number) => {
    setIsLoading(true);
    const response = await fetch(`${API_BASE}/accounts/${accountNumber}`);

    if(response.status !== 200) {
      setAccountNumberError(true);
      setAccountNumberErrorMessage('Account not found');
      setAccount(undefined);
      setIsLoading(false);
      return;
    }
      
    setAccountNumberError(false);
    const data = await response.json();
    setAccount({
      accountNumber: data.account_number,
      name: data.name,
      amount: data.amount,
      type: data.type,
      creditLimit: data.credit_limit,
      dailyWithdrawn: data.dailyWithdrawn
    });
    setIsLoading(false);
  }
  const signOut = async () => {
    setAccount(undefined);
  }

  const Page = () => {
    if(account) {
      return <AccountDashboard account={account} signOut={signOut}/>
    } else {
      return <SignIn 
        signIn={signIn}
        accountNumberError={accountNumberError}
        accountNumberErrorMessage={accountNumberErrorMessage}
        isLoading={isLoading}
      />
    }
  }

  return (
    <div className="app">
      <Grid container>
        <Grid item xs={1} />
        <Grid item xs={10}>
          <Page />
        </Grid>
        <Grid item xs={1} />
      </Grid>
    </div>
  );
}
