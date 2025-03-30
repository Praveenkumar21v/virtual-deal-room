'use client';

import { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead } from '../app/lib/api';
import { Notification } from '../app/lib/types';
import socket from '../app/lib/socket';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await getNotifications();
      setNotifications(data.data);
    };
    fetchNotifications();

    socket.on('newNotification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off('newNotification');
    };
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative cursor-pointer">
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <Badge className="absolute -top-2 -right-2" variant="destructive">
              {notifications.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>
            View and manage your unread notifications here.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p>No new notifications</p>
          ) : (
            notifications.map((notif) => (
              <div key={notif._id} className="flex justify-between items-center">
                <span>{notif.message}</span>
                <Button className='cursor-pointer' size="sm" onClick={() => handleMarkRead(notif._id)}>
                  Mark as Read
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}