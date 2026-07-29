'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import LoginForm from '@/components/shared/login-form';
import CustomerPortal from '@/components/portal/customer/customer-portal';
import AdminPortal from '@/components/portal/admin/admin-portal';
import DriverPortal from '@/components/portal/driver/driver-portal';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, currentPortal, setPortal } = useAppStore();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setPortal(data.user.role as 'customer' | 'admin' | 'driver');
      } else {
        setUser(null);
        setPortal('login');
      }
    } catch {
      setUser(null);
      setPortal('login');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading AquaTrack...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || currentPortal === 'login') {
    return <LoginForm />;
  }

  switch (currentPortal) {
    case 'admin':
      return <AdminPortal />;
    case 'driver':
      return <DriverPortal />;
    case 'customer':
    default:
      return <CustomerPortal />;
  }
}
