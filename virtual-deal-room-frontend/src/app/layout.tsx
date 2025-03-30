import { AuthProvider } from './context/AuthContext';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Virtual Deal Room',
  description: 'Secure Business Transactions Platform',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}

