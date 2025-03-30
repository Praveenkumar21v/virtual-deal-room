import { Deal, User } from '../app/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAuth } from '../app/context/AuthContext';
import { useState } from 'react';
import { api } from '../app/lib/api';
import { toast } from 'sonner';

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  const { user } = useAuth();
  const [dealStatus, setDealStatus] = useState(deal.status);

  const handleStatusUpdate = async (action: 'accept' | 'reject') => {
    try {
      const { data } = await api.put(`/deals/${deal._id}/status`, { action });
      setDealStatus(data.data.status);
      toast.success(`Deal ${action}ed successfully!`);
    } catch (error) {
      toast.error('Failed to update deal status'+ error);
    }
  };

  const sellerEmail = (deal.seller as User)?.email;
  const buyerEmail = (deal.buyer as User)?.email;
  
  const isSeller = user?.email === sellerEmail;
  const isBuyer = user?.email === buyerEmail;

  const getBadgeStyles = (status: string) => {
    switch (status) {
      case 'Pending':
        return {
          variant: 'default' as const,
          className: 'bg-gray-200 text-gray-800',
          dotColor: 'bg-gray-500',
        };
      case 'In Progress':
        return {
          variant: 'default' as const,
          className: 'bg-blue-200 text-blue-800',
          dotColor: 'bg-blue-500',
        };
      case 'Completed':
        return {
          variant: 'default' as const,
          className: 'bg-green-200 text-green-800',
          dotColor: 'bg-green-500',
        };
      case 'Cancelled':
        return {
          variant: 'default' as const, 
          className: 'bg-red-200 text-red-800', 
          dotColor: 'bg-red-500',
        };
      default:
        return {
          variant: 'secondary' as const,
          className: '',
          dotColor: 'bg-gray-500',
        };
    }
  };

  const badgeStyles = getBadgeStyles(dealStatus);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>{deal.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{deal.description}</p>
        <p className="mt-2 font-semibold">Price: ${deal.price}</p>
        <Badge variant={badgeStyles.variant} className={`mt-2 flex items-center space-x-1 ${badgeStyles.className}`}>
        <span className={`h-2 w-2 rounded-full ${badgeStyles.dotColor}`}></span>
        <span>{dealStatus}</span>
                </Badge>
        {isSeller && dealStatus === 'Pending' && (
          <div className="mt-4 flex space-x-2">
            <Button className='cursor-pointer' onClick={() => handleStatusUpdate('accept')} variant="default">Accept</Button>
            <Button className='cursor-pointer' onClick={() => handleStatusUpdate('reject')} variant="destructive">Reject</Button>
          </div>
        )}
        {isBuyer && dealStatus === 'In Progress' && (
          <Link href={`/dashboard/deals/${deal._id}/payment`}>
            <Button className="mt-4 w-full cursor-pointer">Make Payment</Button>
          </Link>
        )}
        <Link href={`/dashboard/deals/${deal._id}`}>
          <Button className="mt-4 w-full cursor-pointer">View Deal</Button>
        </Link>
      </CardContent>
    </Card>
  );
}