"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { getDeals, createDeal, getSellers } from "../lib/api";
import { Deal, Seller } from "../lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Sidebar from "../../components/Sidebar";
import DealCard from "../../components/DealCard";
import NotificationBell from "../../components/NotificationBell";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: "",
    description: "",
    price: "",
    seller: "" as string,
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    const fetchDeals = async () => {
      const { data } = await getDeals();
      setDeals(data.data);
    };
    const fetchSellers = async () => {
      const { data } = await getSellers();
      setSellers(data.data);
    };
    fetchDeals();
    fetchSellers();
  }, [user, router]);

  const handleCreateDeal = async () => {
    if (user?.role === "seller" && newDeal.seller === user._id) {
      toast.error("Sellers cannot create deals for themselves.");
      return;
    }
    await createDeal({
      title: newDeal.title,
      description: newDeal.description,
      price: parseFloat(newDeal.price),
      seller: newDeal.seller,
    });
    toast.success("Deal created successfully!");
    setNewDeal({ title: "", description: "", price: "", seller: "" });
    const { data } = await getDeals();
    setDeals(data.data);
    setDialogOpen(false);

  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-grow"></div>
          <div className="flex items-center space-x-4 ">
            <NotificationBell/>
            <Button className="cursor-pointer" onClick={logout}>Logout</Button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
            <Button className="cursor-pointer">Create New Deal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Deal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={newDeal.title}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, title: e.target.value })
                }
              />
              <Input
                placeholder="Description"
                value={newDeal.description}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, description: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Price"
                value={newDeal.price}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, price: e.target.value })
                }
              />
              <select
                value={newDeal.seller}
                onChange={(e) =>
                  setNewDeal({ ...newDeal, seller: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="">Select Seller</option>
                {sellers
                  .filter(
                    (seller) =>
                      !(user.role === "seller" && seller._id === user._id)
                  )
                  .map((seller) => (
                    <option key={seller._id} value={seller._id}>
                      {seller.email}
                    </option>
                  ))}
              </select>
              <Button onClick={handleCreateDeal}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Active Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deals.map((deal) => (
                <DealCard key={deal._id} deal={deal} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
