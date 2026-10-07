import { useState } from "react";
import Paper from "@mui/material/Paper/Paper";
import { Button, Card, CardContent, Grid, Alert } from "@mui/material";
import { account } from "../Types/Account";
import { validateDeposit, validateWithdrawal } from "../utils/validators";
import { NumericInput } from "./NumericInput";
import { depositApi, withdrawApi } from "../services/transactionService";

type AccountDashboardProps = {
  account: account;
  signOut: () => Promise<void>;
}

export const AccountDashboard = (props: AccountDashboardProps) => {
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [account, setAccount] = useState(props.account); 
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { amount, name, accountNumber } = account;

  const {signOut} = props;

  const depositFunds = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    const validationError = validateDeposit(account, depositAmount);
    if (validationError) {
      setErrorMessage(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const data = await depositApi(accountNumber, depositAmount);

      setAccount({
        accountNumber: data.account_number,
        name: data.name,
        amount: data.amount,
        type: data.type,
        creditLimit: data.credit_limit,
        dailyWithdrawn: data.dailyWithdrawn
      });
      setSuccessMessage(`Successfully deposited $${depositAmount}. New balance: $${data.amount}`);
      setDepositAmount(0);
      setIsLoading(false);
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    }
  }

  const withdrawFunds = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    const validationError = validateWithdrawal(account, withdrawAmount);
    if (validationError) {
      setErrorMessage(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const data = await withdrawApi(accountNumber, withdrawAmount);
      
      setAccount({
        accountNumber: data.account_number,
        name: data.name,
        amount: data.amount,
        type: data.type,
        creditLimit: data.credit_limit,
        dailyWithdrawn: data.dailyWithdrawn
      });
      setSuccessMessage(`Successfully withdrew $${withdrawAmount}. New balance: $${data.amount}`);
      setWithdrawAmount(0);
      setIsLoading(false);
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    }
  }

  return (
    <Paper className="account-dashboard">
      <div className="dashboard-header">
        <h1>Hello, {name}!</h1>
        <Button variant="contained" onClick={signOut}>Sign Out</Button>
      </div>

      <h2>Balance: ${amount}</h2>

      {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      <Grid container spacing={2} padding={2}>
        <Grid item xs={6}>
          <Card className="deposit-card">
            <CardContent>
              <h3>Deposit</h3>
              <NumericInput
                label="Deposit Amount"
                variant="outlined"
                value={depositAmount}
                inputProps={{ min: 1, step: 1 }}
                onChange={setDepositAmount}
                sx={{
                  display: 'flex',
                  margin: 'auto',
                }}
              />
              <Button 
                variant="contained" 
                sx={{
                  display: 'flex', 
                  margin: 'auto', 
                  marginTop: 2
                }}
                onClick={depositFunds}
                disabled={isLoading}
              >
                Submit
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card className="withdraw-card">
            <CardContent>
              <h3>Withdraw</h3>
              <NumericInput
                label="Withdraw Amount"
                variant="outlined"
                value={withdrawAmount}
                inputProps={{ min: 5, step: 5 }}
                onChange={setWithdrawAmount}
                sx={{
                  display: 'flex',
                  margin: 'auto',
                }}
              />
              <Button 
                variant="contained" 
                sx={{
                  display: 'flex', 
                  margin: 'auto', 
                  marginTop: 2
                }}
                onClick={withdrawFunds}
                disabled={isLoading}
              >
                Submit
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
    
  )
}