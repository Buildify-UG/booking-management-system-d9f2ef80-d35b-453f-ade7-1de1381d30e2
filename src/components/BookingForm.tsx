import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface BookingFormProps {
  cities: any[];
  routes: any[];
  onSuccess: () => void;
}

export default function BookingForm({ cities, routes, onSuccess }: BookingFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    booking_code: '',
    booking_date: new Date().toISOString().split('T')[0],
    trip_date: '',
    from_city: '',
    to_city: '',
    ticket_price: '',
    num_tickets: '1',
    booking_url: '',
    notes: '',
  });

  const calculateCommission = (price: number) => {
    const commission = price * 0.1;
    return Math.ceil(commission * 100) / 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const ticketPrice = parseFloat(formData.ticket_price);
      const numTickets = parseInt(formData.num_tickets);
      const totalAmount = ticketPrice * numTickets;
      const commission = calculateCommission(totalAmount);
      const netAmount = totalAmount - commission;

      const { error } = await supabase.from('bookings').insert([
        {
          booking_code: formData.booking_code,
          booking_date: formData.booking_date,
          trip_date: formData.trip_date,
          from_city_id: formData.from_city,
          to_city_id: formData.to_city,
          ticket_price: ticketPrice,
          num_tickets: numTickets,
          total_amount: totalAmount,
          commission_amount: commission,
          net_amount: netAmount,
          booking_url: formData.booking_url,
          status: 'pending',
          notes: formData.notes,
          created_by: user.id,
        },
      ]);

      if (error) throw error;
      toast.success('تم إضافة الحجز بنجاح');
      setFormData({
        booking_code: '',
        booking_date: new Date().toISOString().split('T')[0],
        trip_date: '',
        from_city: '',
        to_city: '',
        ticket_price: '',
        num_tickets: '1',
        booking_url: '',
        notes: '',
      });
      onSuccess();
    } catch (error) {
      toast.error('خطأ في إضافة الحجز');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إضافة حجز جديد</CardTitle>
        <CardDescription>ملء بيانات الحجز من منصة Bookaway</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="booking_code">كود الحجز *</Label>
              <Input
                id="booking_code"
                value={formData.booking_code}
                onChange={(e) => setFormData({ ...formData, booking_code: e.target.value })}
                placeholder="أدخل كود الحجز"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking_date">تاريخ الحجز *</Label>
              <Input
                id="booking_date"
                type="date"
                value={formData.booking_date}
                onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trip_date">تاريخ الرحلة *</Label>
              <Input
                id="trip_date"
                type="date"
                value={formData.trip_date}
                onChange={(e) => setFormData({ ...formData, trip_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="num_tickets">عدد التذاكر *</Label>
              <Input
                id="num_tickets"
                type="number"
                min="1"
                value={formData.num_tickets}
                onChange={(e) => setFormData({ ...formData, num_tickets: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from_city">من المدينة *</Label>
              <Select value={formData.from_city} onValueChange={(value) => setFormData({ ...formData, from_city: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="to_city">إلى المدينة *</Label>
              <Select value={formData.to_city} onValueChange={(value) => setFormData({ ...formData, to_city: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ticket_price">سعر التذكرة *</Label>
              <Input
                id="ticket_price"
                type="number"
                step="0.01"
                value={formData.ticket_price}
                onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
                placeholder="أدخل السعر"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking_url">رابط الحجز</Label>
              <Input
                id="booking_url"
                type="url"
                value={formData.booking_url}
                onChange={(e) => setFormData({ ...formData, booking_url: e.target.value })}
                placeholder="رابط الحجز على Bookaway"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أي ملاحظات إضافية"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'جاري الحفظ...' : 'حفظ الحجز'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
