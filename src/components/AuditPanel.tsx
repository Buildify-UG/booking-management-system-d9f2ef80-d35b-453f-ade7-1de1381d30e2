import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AuditPanelProps {
  cities: any[];
  onDataRefresh: () => void;
}

export default function AuditPanel({ cities, onDataRefresh }: AuditPanelProps) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 100;

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
      setFilteredBookings(data || []);
    } catch (error) {
      toast.error('خطأ في تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'approved' })
        .eq('id', bookingId);

      if (error) throw error;
      toast.success('تم اعتماد الحجز');
      loadBookings();
      onDataRefresh();
    } catch (error) {
      toast.error('خطأ في اعتماد الحجز');
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'rejected' })
        .eq('id', bookingId);

      if (error) throw error;
      toast.success('تم رفض الحجز');
      loadBookings();
      onDataRefresh();
    } catch (error) {
      toast.error('خطأ في رفض الحجز');
    }
  };

  const getCityName = (cityId: string) => {
    return cities.find((c) => c.id === cityId)?.name || 'غير معروف';
  };

  const paginatedBookings = filteredBookings.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>مراجعة الحجوزات</CardTitle>
        <CardDescription>اعتماد أو رفض الحجوزات المعلقة</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-center text-muted-foreground">جاري التحميل...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-right py-2 px-2">الكود</th>
                    <th className="text-right py-2 px-2">التاريخ</th>
                    <th className="text-right py-2 px-2">من → إلى</th>
                    <th className="text-right py-2 px-2">التذاكر</th>
                    <th className="text-right py-2 px-2">الإجمالي</th>
                    <th className="text-right py-2 px-2">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border hover:bg-muted">
                      <td className="py-2 px-2 font-mono text-primary">{booking.booking_code}</td>
                      <td className="py-2 px-2">{booking.trip_date}</td>
                      <td className="py-2 px-2 text-sm">
                        {getCityName(booking.from_city_id)} → {getCityName(booking.to_city_id)}
                      </td>
                      <td className="py-2 px-2">{booking.num_tickets}</td>
                      <td className="py-2 px-2 font-semibold">{booking.total_amount.toFixed(2)}</td>
                      <td className="py-2 px-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-success hover:bg-success/10"
                            onClick={() => handleApprove(booking.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleReject(booking.id)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {paginatedBookings.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">لا توجد حجوزات معلقة</p>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  السابق
                </Button>
                <span className="text-sm flex items-center">
                  صفحة {page} من {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
