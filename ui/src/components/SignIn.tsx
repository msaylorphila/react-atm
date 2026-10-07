import { useState } from 'react';
import {Paper, Grid, Button} from '@mui/material';
import { NumericInput } from './NumericInput';

type SignInProps = {
  accountNumberError: boolean;
  signIn: (accountNumber: number) => Promise<void>;
  isLoading: boolean;
  accountNumberErrorMessage: string;
}

export const SignIn = (props: SignInProps) => {
  const {signIn, accountNumberError, isLoading, accountNumberErrorMessage} = props;
  const [accountNumber, setAccountNumber] = useState(0);

  return (
    <Paper sx={{ border: 20, borderBottom: 30, borderColor: 'white' }}> 
            <h1 className='app-title'>Please Sign in with your Account Number:</h1>
            <Grid container>
              <Grid item xs={2} />
              <Grid item xs={8}>
                <NumericInput
                  label='Account Number'
                  variant='outlined'
                  sx={{ display: 'flex', margin: 'auto' }}
                  value={accountNumber}
                  onChange={setAccountNumber}
                  inputProps={{ min: 1, step: 1 }}
                  error={accountNumberError}
                  helperText={accountNumberError ? accountNumberErrorMessage : ''}
                />
              </Grid>
              <Grid item xs={2} />
            </Grid>
            <Button 
              variant='contained' 
              color='primary' 
              sx={{
                display: 'block',
                margin: 'auto',
                marginTop: 2,
              }}
              onClick={async() => await signIn(accountNumber)}
              disabled={isLoading}
            >
              Sign In
            </Button>
          </Paper>
  )
}