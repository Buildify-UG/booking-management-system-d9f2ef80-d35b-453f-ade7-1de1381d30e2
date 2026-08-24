import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DollarSign } from 'lucide-react';

interface AccountsPanelProps {
  balance: number;
  onRefresh: () => void;
}

export default function AccountsPanel({ balance: initialBalance, onRefresh }: AccountsPanelProps) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(initialBalance);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount) return;

    setIsLoading(true);
    try {
      const newAmount = parseFloat(amount);

      // Update or create balance record
      const { data: existing } = await supabase
        .from('account_balance')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('account_balance')
          .update({ balance: balance + newAmount })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('account_balance').insert([
          {
            balance: newAmount,
          },
        ]);

        if (error) throw error;
      }

      // Record transaction
      await supabase.from('account_transactions').insert([
        {
          transaction_type: 'deposit',
          amount: newAmount,
          notes: notes || 'إيداع رصيد',
          created_by: user.id,
        },
      ]);

      setBalance(balance + newAmount);
      setAmount('');
      setNotes('');
      toast.success('تم إضافة الرصيد بنجاح');
      onRefresh();
    } catch (error) {
      toast.error('خطأ في إضافة الرصيد');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            الرصيد الحالي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary mb-2">{balance.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground">رصيد منصة Bookaway</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إضافة رصيد</CardTitle>
          <CardDescription>شحن الرصيد بمبلغ جديد</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddBalance} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="أدخل المبلغ"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثلاً: شيك شحن رقم 123"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'جاري الإضافة...' : 'إضافة الرصيد'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
