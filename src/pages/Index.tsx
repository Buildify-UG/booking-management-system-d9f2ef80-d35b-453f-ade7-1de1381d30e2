import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import BookingsList from '@/components/BookingsList';
import AuditPanel from '@/components/AuditPanel';
import Settings from '@/components/Settings';
import AccountsPanel from '@/components/AccountsPanel';
import AccountTransactions from '@/components/AccountTransactions';
import { toast } from 'sonner';

export default function IndexPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadInitialData();
  }, [user, navigate]);

  const loadInitialData = async () => {
    try {
      const [citiesRes, routesRes, balanceRes] = await Promise.all([
        supabase.from('cities').select('*'),
        supabase.from('routes').select('*'),
        supabase.from('account_balance').select('balance').limit(1),
      ]);

      if (citiesRes.data) setCities(citiesRes.data);
      if (routesRes.data) setRoutes(routesRes.data);
      if (balanceRes.data?.[0]) setBalance(balanceRes.data[0].balance);
    } catch (error) {
      toast.error('خطأ في تحميل البيانات');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('تم تسجيل الخروج');
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isAccountant = user.role === 'accountant';
  const isBookingOfficer = user.role === 'booking_officer';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">نظام إدارة الحجوزات</h1>
            <p className="text-sm text-muted-foreground">مرحباً {user.username}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} size="sm">
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full gap-2 grid-cols-2 md:grid-cols-5 lg:grid-cols-6">
            {(isBookingOfficer || isAccountant || isAdmin) && (
              <TabsTrigger value="bookings">الحجوزات</TabsTrigger>
            )}
            {(isBookingOfficer || isAccountant || isAdmin) && (
              <TabsTrigger value="new-booking">إضافة حجز</TabsTrigger>
            )}
            {(isAccountant || isAdmin) && (
              <TabsTrigger value="audit">المراجعة</TabsTrigger>
            )}
            {(isAccountant || isAdmin) && (
              <TabsTrigger value="accounts">الحسابات</TabsTrigger>
            )}
            {(isAccountant || isAdmin) && (
              <TabsTrigger value="transactions">حركات الحساب</TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="settings">الإعدادات</TabsTrigger>
            )}
          </TabsList>

          {/* Bookings List */}
          {(isBookingOfficer || isAccountant || isAdmin) && (
            <TabsContent value="bookings" className="space-y-4">
              <BookingsList cities={cities} onDataRefresh={loadInitialData} />
            </TabsContent>
          )}

          {/* New Booking Form */}
          {(isBookingOfficer || isAccountant || isAdmin) && (
            <TabsContent value="new-booking" className="space-y-4">
              <BookingForm
                cities={cities}
                routes={routes}
                onSuccess={() => {
                  loadInitialData();
                  toast.success('تم إضافة الحجز بنجاح');
                }}
              />
            </TabsContent>
          )}

          {/* Audit Panel */}
          {(isAccountant || isAdmin) && (
            <TabsContent value="audit" className="space-y-4">
              <AuditPanel cities={cities} onDataRefresh={loadInitialData} />
            </TabsContent>
          )}

          {/* Accounts */}
          {(isAccountant || isAdmin) && (
            <TabsContent value="accounts" className="space-y-4">
              <AccountsPanel balance={balance} onRefresh={loadInitialData} />
            </TabsContent>
          )}

          {/* Account Transactions */}
          {(isAccountant || isAdmin) && (
            <TabsContent value="transactions" className="space-y-4">
              <AccountTransactions />
            </TabsContent>
          )}

          {/* Settings */}
          {isAdmin && (
            <TabsContent value="settings" className="space-y-4">
              <Settings onRefresh={loadInitialData} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
