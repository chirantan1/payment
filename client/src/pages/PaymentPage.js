import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Typography, Paper, CircularProgress } from '@material-ui/core';
import useStyles from '../styles/paymentStyles';
import paymentService from '../services/paymentService';

const PaymentPage = () => {
  const classes = useStyles();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    try {
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const response = await paymentService.processPayment({
        paymentMethodId: paymentMethod.id,
        amount: 1000, // $10.00 in cents
        currency: 'usd',
      });

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper className={classes.paper}>
      <Typography variant="h4" gutterBottom>
        Payment Gateway
      </Typography>
      {success ? (
        <Typography variant="body1">
          Payment successful! Thank you for your purchase.
        </Typography>
      ) : (
        <form onSubmit={handleSubmit} className={classes.form}>
          <CardElement className={classes.cardElement} />
          {error && (
            <Typography color="error" className={classes.error}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!stripe || loading}
            className={classes.button}
          >
            {loading ? <CircularProgress size={24} /> : 'Pay $10.00'}
          </Button>
        </form>
      )}
    </Paper>
  );
};

export default PaymentPage;