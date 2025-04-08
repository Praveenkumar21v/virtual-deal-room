'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, BarChart2, Menu } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getMe } from '../app/lib/api';
import logo from '../app/assets/online-resume.png';

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string; createdAt: string } | null>(null);
  const [avatarColor, setAvatarColor] = useState<string>('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await getMe();
        setUser(data.data);
        setAvatarColor(getRandomColor());
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  };

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-gray-800 text-white p-6 flex flex-col transition-transform duration-300 z-50 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:sticky lg:h-screen`}
      >
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="p-2 text-white bg-gray-700 rounded lg:hidden cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <Menu />
          </Button>
        </div>
        <div>
          <Link href="/dashboard" className="flex items-center">
            <Image src={logo} alt="Virtual Deal Room Logo" width={40} height={40} className="mr-2" />
            <h2 className="text-xl font-bold">Virtual Deal Room</h2>
          </Link>
        </div>
        <nav className="space-y-3 flex-1 mt-4">
          <Link
            href="/dashboard"
            className="flex items-center p-2 hover:bg-gray-700 rounded"
            onClick={() => setIsOpen(false)}
          >
            <Home className="mr-2" /> Dashboard
          </Link>
          <Link
            href="/dashboard/analytics"
            className="flex items-center p-2 hover:bg-gray-700 rounded"
            onClick={() => setIsOpen(false)}
          >
            <BarChart2 className="mr-2" /> Analytics
          </Link>
        </nav>
        {user && (
          <div className="flex items-center mt-4 cursor-pointer" onClick={() => setProfileOpen(true)}>
            <Avatar className="mr-2" style={{ color: avatarColor }}>
              <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>{user.email.split('@')[0]}</span>
          </div>
        )}
      </div>

      {!isOpen && (
        <Button
          variant="ghost"
          className="lg:hidden p-2 fixed top-4 left-4 z-50 bg-gray-700 text-white rounded cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <Menu />
        </Button>
      )}

      {user && (
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Profile</DialogTitle>
              <DialogDescription>Fetch user details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <strong>Email:</strong> {user.email}
              </div>
              <div>
                <strong>Role:</strong> {user.role}
              </div>
              <div>
                <strong>Created At:</strong> {formatDate(user.createdAt)}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}