"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { getDeal, updateDeal, createPaymentIntent } from "../../../lib/api";
import { Deal } from "../../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import socket from "../../../lib/socket";
import Sidebar from "../../../../components/Sidebar";
import { useAuth } from "@/app/context/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import { toast } from "sonner";
import { Triangle } from "react-loader-spinner";
import { Badge } from "@/components/ui/badge";

const Chat = dynamic(() => import("../../../../components/Chat"), {
  ssr: false,
});
const DocumentUpload = dynamic(
  () => import("../../../../components/DocumentUpload"),
  { ssr: false }
);
const PaymentForm = dynamic(
  () => import("../../../../components/PaymentForm"),
  { ssr: false }
);

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const getBadgeStyles = (status: string) => {
  switch (status) {
    case "Pending":
      return { className: "bg-gray-200 text-gray-800", dotColor: "bg-gray-500" };
    case "In Progress":
      return { className: "bg-blue-200 text-blue-800", dotColor: "bg-blue-500" };
    case "Completed":
      return { className: "bg-green-200 text-green-800", dotColor: "bg-green-500" };
    case "Cancelled":
      return { className: "bg-red-200 text-red-800", dotColor: "bg-red-500" };
    default:
      return { className: "bg-gray-300 text-gray-700", dotColor: "bg-gray-500" };
  }
};

export default function DealPage() {
  const { user, logout } = useAuth();
  const { dealId } = useParams();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const { data } = await getDeal(dealId as string);
        setDeal(data.data);
      } catch (error) {
        toast.error("Failed to fetch deal" + error);
      }
    };
    fetchDeal();

    socket.emit("joinDeal", dealId);

    socket.on("priceUpdate", ({ dealId: updatedDealId, price }) => {
      if (updatedDealId === dealId) {
        setDeal((prev) => (prev ? { ...prev, price } : prev));
      }
    });

    socket.on("dealStatusUpdate", ({ dealId: updatedDealId, status }) => {
      if (updatedDealId === dealId) {
        setDeal((prev) => (prev ? { ...prev, status } : prev));
      }
    });

    socket.on("dealCompleted", (updatedDeal) => {
      if (updatedDeal._id === dealId) {
        setDeal(updatedDeal);
      }
    });

    return () => {
      socket.off("priceUpdate");
      socket.off("dealStatusUpdate");
      socket.off("dealCompleted");
    };
  }, [dealId]);

  const handleNegotiate = async () => {
    if (!newPrice) return;
    await updateDeal(dealId as string, { price: parseFloat(newPrice) });
    socket.emit("negotiatePrice", { dealId, newPrice: parseFloat(newPrice) });
    setNewPrice("");
  };

  const handlePayment = async () => {
    try {
      const { data } = await createPaymentIntent(dealId as string);
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast.error("Failed to initiate payment" + error);
    }
  };

  if (!deal)
    return (
      <div className="p-6">
        <Triangle
          visible={true}
          height="80"
          width="80"
          color="#4fa94d"
          ariaLabel="triangle-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );

  const isBuyer =
    user?._id ===
    (typeof deal.buyer === "string" ? deal.buyer : deal.buyer._id);
    
    const badgeStyles = getBadgeStyles(deal.status);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 animate-fade-in">
        <div className="flex justify-end">
          <div className="flex items-center space-x-4 mb-3">
            <NotificationBell />
            <Button className="cursor-pointer" onClick={logout}>Logout</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{deal.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{deal.description}</p>
            <p className="mt-2 font-semibold">Price: ${deal.price}</p>
            <Badge className={`mt-2 flex items-center space-x-1 ${badgeStyles.className}`}>
              <span className={`h-2 w-2 rounded-full ${badgeStyles.dotColor}`}></span>
              <span>{deal.status}</span>
            </Badge>
                        {user?.role === "buyer" && (
              <div className="mt-4 flex space-x-2">
                <Input
                  type="number"
                  placeholder="New Price"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
                <Button className="cursor-pointer" onClick={handleNegotiate}>Negotiate</Button>
              </div>
            )}

            {isBuyer && deal.status === "In Progress" && (
              <Button onClick={handlePayment} className="mt-4 cursor-pointer">
                Pay Now
              </Button>
            )}

            {clientSecret && (
              <Elements stripe={stripePromise}>
                <PaymentForm
                  clientSecret={clientSecret}
                  dealId={dealId as string}
                />
              </Elements>
            )}
          </CardContent>
        </Card>
        <DocumentUpload dealId={dealId as string} />
        <Chat dealId={dealId as string} />
      </div>
    </div>
  );
}
