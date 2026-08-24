import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface BookingsListProps {
  cities: any[];
  onDataRefresh: () => void;
}

export default function BookingsList({ cities, onDataRefresh }: BookingsListProps) {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    code: '',
    bookingDateFrom: '',
    bookingDateTo: '',
    tripDateFrom: '',
    tripDateTo: '',
    fromCity: '',
    toCity: '',
    status: 'all',
  });
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
      applyFilters(data || []);
    } catch (error) {
      toast.error('خطأ في تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (data: any[]) => {
    let filtered = data;

    if (filters.code) {
      filtered = filtered.filter((b) => b.booking_code.includes(filters.code));
    }
    if (filters.bookingDateFrom) {
      filtered = filtered.filter((b) => b.booking_date >= filters.bookingDateFrom);
    }
    if (filters.bookingDateTo) {
      filtered = filtered.filter((b) => b.booking_date <= filters.bookingDateTo);
    }
    if (filters.tripDateFrom) {
      filtered = filtered.filter((b) => b.trip_date >= filters.tripDateFrom);
    }
    if (filters.tripDateTo) {
      filtered = filtered.filter((b) => b.trip_date <= filters.tripDateTo);
    }
    if (filters.fromCity) {
      filtered = filtered.filter((b) => b.from_city_id === filters.fromCity);
    }
    if (filters.toCity) {
      filtered = filtered.filter((b) => b.to_city_id === filters.toCity);
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter((b) => b.status === filters.status);
    }

    setFilteredBookings(filtered);
    setPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(bookings);
  };

  const getCityName = (cityId: string) => {
    return cities.find((c) => c.id === cityId)?.name || 'غير معروف';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-warning text-warning-foreground',
      approved: 'bg-success text-success-foreground',
      rejected: 'bg-destructive text-destructive-foreground',
    };
    const labels: Record<string, string> = {
      pending: 'قيد المراجعة',
      approved: 'معتمد',
      rejected: 'مرفوض',
    };
    return <Badge className={variants[status]}>{labels[status]}</Badge>;
  };

  const paginatedBookings = filteredBookings.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const totalAmount = filteredBookings.reduce((sum, b) => sum + b.total_amount, 0);
  const totalCommission = filteredBookings.reduce((sum, b) => sum + b.commission_amount, 0);
  const totalNet = filteredBookings.reduce((sum, b) => sum + b.net_amount, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تقرير الحجوزات</CardTitle>
          <CardDescription>عرض وتصفية جميع الحجوزات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">كود الحجز</Label>
              <Input
                placeholder="ابحث بالكود"
                value={filters.code}
                onChange={(e) => handleFilterChange('code', e.target.value)}
                size={1}
              />
            </div>
            <div>
              <Label className="text-xs">من تاريخ الحجز</Label>
              <Input
                type="date"
                value={filters.bookingDateFrom}
                onChange={(e) => handleFilterChange('bookingDateFrom', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">إلى تاريخ الحجز</Label>
              <Input
                type="date"
                value={filters.bookingDateTo}
                onChange={(e) => handleFilterChange('bookingDateTo', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">الحالة</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                  <SelectItem value="approved">معتمد</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-muted rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">عدد النتائج</p>
              <p className="text-2xl font-bold">{filteredBookings.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">الإجمالي</p>
              <p className="text-2xl font-bold">{totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">العمولة</p>
              <p className="text-2xl font-bold text-warning">{totalCommission.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">الصافي</p>
              <p className="text-2xl font-bold text-success">{totalNet.toFixed(2)}</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-right py-2 px-2">الكود</th>
                  <th className="text-right py-2 px-2">تاريخ الحجز</th>
                  <th className="text-right py-2 px-2">تاريخ الرحلة</th>
                  <th className="text-right py-2 px-2">من</th>
                  <th className="text-right py-2 px-2">إلى</th>
                  <th className="text-right py-2 px-2">السعر</th>
                  <th className="text-right py-2 px-2">التذاكر</th>
                  <th className="text-right py-2 px-2">الإجمالي</th>
                  <th className="text-right py-2 px-2">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border hover:bg-muted">
                    <td className="py-2 px-2">
                      {booking.booking_url ? (
                        <a
                          href={booking.booking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {booking.booking_code}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        booking.booking_code
                      )}
                    </td>
                    <td className="py-2 px-2">{booking.booking_date}</td>
                    <td className="py-2 px-2">{booking.trip_date}</td>
                    <td className="py-2 px-2">{getCityName(booking.from_city_id)}</td>
                    <td className="py-2 px-2">{getCityName(booking.to_city_id)}</td>
                    <td className="py-2 px-2">{booking.ticket_price}</td>
                    <td className="py-2 px-2">{booking.num_tickets}</td>
                    <td className="py-2 px-2 font-semibold">{booking.total_amount.toFixed(2)}</td>
                    <td className="py-2 px-2">{getStatusBadge(booking.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                السابق
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  صفحة {page} من {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                التالي
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
