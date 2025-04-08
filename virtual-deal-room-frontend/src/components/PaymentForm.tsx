'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { updateDeal } from '../app/lib/api';
import { useRouter } from 'next/navigation';

interface PaymentFormProps {
  clientSecret: string;
  dealId: string;
}

export default function PaymentForm({ clientSecret, dealId }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement! },
    });

    console.log("paymentIntent",paymentIntent);

    if (error) {
      toast.error(error.message);
    } else if (paymentIntent?.status === 'succeeded') {
      await updateDeal(dealId, { status: 'Completed' });
      toast.success('Payment completed successfully!');
      router.push('/dashboard')
    }
    setLoading(false);
  };

  return (
    <Card className="mt-4 animate-fade-in">
      <CardHeader>
        <CardTitle>Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <CardElement className="p-2 border rounded" />
          <Button type="submit" disabled={!stripe || loading} className="mt-4 w-full cursor-pointer">
            {loading ? 'Processing...' : 'Pay Now'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}