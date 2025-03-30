'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 animate-fade-in">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Welcome to Virtual Deal Room</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">Securely negotiate and finalize business transactions.</p>
          {user ? (
            <Button onClick={() => router.push('/dashboard')} className="w-full cursor-pointer">
              Go to Dashboard
            </Button>
          ) : (
            <div className="space-y-4">
              <Button onClick={() => router.push('/auth/login')} className="w-full cursor-pointer">
                Login
              </Button>
              <Button variant="outline" onClick={() => router.push('/auth/register')} className="w-full cursor-pointer">
                Register
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}