"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { createPaymentIntent } from "../../../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import PaymentForm from "../../../../../components/PaymentForm";
import { Triangle } from "react-loader-spinner";
import logo from "../../../../assets/online-resume.png";
import Image from "next/image";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function PaymentPage() {
  const { dealId } = useParams();
  const [clientSecret, setClientSecret] = useState("");
  const router = useRouter();

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const { data } = await createPaymentIntent(dealId as string);
        setClientSecret(data.clientSecret);
      } catch (error) {
        toast.error("Failed to initiate payment: " + error);
      }
    };
    initializePayment();
  }, [dealId]);

  if (!clientSecret) return;
  <div>
    <Triangle
      visible={true}
      height="80"
      width="80"
      color="#4fa94d"
      ariaLabel="triangle-loading"
      wrapperStyle={{}}
      wrapperClass=""
    />
  </div>;

  return (
    <div className="p-6">
       <div className="flex justify-between items-center mb-4">
        <Image src={logo} alt="Logo" width={50} height={50} className="cursor-pointer" onClick={() => router.push("/dashboard")} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise}>
            <PaymentForm
              clientSecret={clientSecret}
              dealId={dealId as string}
            />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}
