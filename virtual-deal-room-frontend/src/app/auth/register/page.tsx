'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner'; 
import Image from 'next/image';
import resumeIcon from '@/app/assets/online-resume.png'; 
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, role);
      toast.success('Registration successful! Please log in.');
      router.push('/auth/login'); 
    } catch (err) {
      toast.error('Registration failed'+err); 
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
          <CardTitle>Register</CardTitle>
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
            <Select onValueChange={(value: 'buyer' | 'seller') => setRole(value)} defaultValue="buyer">
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full cursor-pointer">
              Register
            </Button>
          </form>
          <p className="mt-4 text-center">
            Already have an account?{' '}
            <a href="/auth/login" className="text-blue-500 hover:underline">
              Login here
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}