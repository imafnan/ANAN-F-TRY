'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Image as ImageIcon,
  Ticket,
  Settings,
  LogOut,
  Menu,
  X,
  UserCheck,
  RefreshCw
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Auth Protection Check against backend /admin/auth/me
  useEffect(() => {
    // Skip protection check on login page
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const verifySession = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/admin/auth/me');

        if (isMounted) {
          if (data.success && data.admin) {
            setAdminUser(data.admin);
            setAuthorized(true);
          } else {
            setAuthorized(false);
            router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[AUTH] Admin session check failed:', err);
          setAuthorized(false);
          router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await apiFetch('/admin/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Backend logout cleanup skipped:', err);
    } finally {
      localStorage.removeItem('forrabix_admin_token');
      localStorage.removeItem('forrabix_admin_user');
      router.replace('/admin/login');
    }
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <RefreshCw className="h-7 w-7 text-primary animate-spin mx-auto" />
          <p className="text-[10px] tracking-widest text-primary/60 uppercase font-semibold">SECURE AUTH SESSION CHECK...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Banners', path: '/admin/banners', icon: ImageIcon },
    { label: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-background border-b border-primary/10 h-16 px-4 flex items-center justify-between no-print">
        <Link href="/admin" className="font-serif text-xl font-bold tracking-widest text-primary">
          FORRABIX ADMIN
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-primary hover:opacity-85 p-1"
          id="admin-mobile-menu-toggle"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION (DESKTOP) */}
      <aside className="hidden md:flex flex-col w-64 bg-cream-light/10 border-r border-primary/10 min-h-screen p-6 space-y-8 no-print">
        
        {/* Brand Header */}
        <div className="space-y-1">
          <Link href="/admin" className="font-serif text-2xl font-bold tracking-widest text-primary block">
            FORRABIX
          </Link>
          <div className="flex items-center space-x-1.5 text-[9px] text-primary/70 tracking-widest uppercase font-semibold">
            <UserCheck className="h-3 w-3 text-primary" />
            <span>Admin: {adminUser?.email || 'FORRABIX'}</span>
          </div>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 flex flex-col space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-3 px-4 py-3 text-xs tracking-wider font-medium uppercase transition-colors ${
                  isActive
                    ? 'bg-primary text-background'
                    : 'text-primary/80 hover:bg-cream-light/35 hover:text-primary'
                }`}
                id={`sidebar-link-${item.label.toLowerCase()}`}
              >
                <Icon className="h-4.5 w-4.5 stroke-[1.8]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="pt-4 border-t border-primary/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-xs tracking-wider font-semibold text-red-700 hover:bg-red-50 transition-colors uppercase"
            id="admin-logout-btn"
          >
            <LogOut className="h-4.5 w-4.5 stroke-[2]" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/95 flex flex-col p-6 space-y-6 animate-in fade-in duration-200 no-print">
          <div className="flex justify-between items-center pb-4 border-b border-primary/10">
            <span className="font-serif text-xl font-bold tracking-widest text-primary">FORRABIX</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-primary p-1">
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 flex flex-col space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3.5 text-xs tracking-wider font-medium uppercase border ${
                    isActive
                      ? 'bg-primary text-background border-primary'
                      : 'border-primary/10 text-primary'
                  }`}
                  id={`mobile-sidebar-link-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-primary/10">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center space-x-3 py-3.5 border border-red-200 text-xs font-bold text-red-700 bg-red-50 uppercase tracking-widest"
              id="admin-mobile-logout"
            >
              <LogOut className="h-4.5 w-4.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ADMIN CONTENT WRAPPER */}
      <main className="flex-1 min-w-0 bg-background md:p-10 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
