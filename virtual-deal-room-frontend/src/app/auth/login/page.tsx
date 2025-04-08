// Login page (page.tsx)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner'; 
import Image from 'next/image';
import resumeIcon from '@/app/assets/online-resume.png';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/'); 
    } catch (error) {
      toast.error('Invalid credentials' + error); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Image src={resumeIcon} alt="Home" width={50} height={50} />
        </Link>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" className="w-full cursor-pointer">
              Login
            </Button>
          </form>
          <p className="mt-4 text-center">
            New user?{' '}
            <a href="/auth/register" className="text-blue-500 hover:underline">
              Create an account
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}