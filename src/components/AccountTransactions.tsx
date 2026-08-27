import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const itemsPerPage = 100;

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('account_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
      applyFilters(data || []);
    } catch (error) {
      toast.error('خطأ في تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (data: any[]) => {
    let filtered = data;

    if (filters.type !== 'all') {
      filtered = filtered.filter((t) => t.transaction_type === filters.type);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter((t) => new Date(t.created_at).toISOString().split('T')[0] >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter((t) => new Date(t.created_at).toISOString().split('T')[0] <= filters.dateTo);
    }

    setFilteredTransactions(filtered);
    setPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(transactions);
  };

  const paginatedTransactions = filteredTransactions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const totalDeposits = filteredTransactions
    .filter((t) => t.transaction_type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = filteredTransactions
    .filter((t) => t.transaction_type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalDeposits - totalDebits;

  return (
    <Card>
      <CardHeader>
        <CardTitle>حركات الحساب</CardTitle>
        <CardDescription>سجل جميع عمليات الإيداع والخصم</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">نوع العملية</Label>
            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="deposit">إيداع</SelectItem>
                <SelectItem value="debit">خصم</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">من التاريخ</Label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">إلى التاريخ</Label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-muted rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">عدد العمليات</p>
            <p className="text-2xl font-bold">{filteredTransactions.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">إجمالي الإيداعات</p>
            <p className="text-2xl font-bold text-success">{totalDeposits.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">إجمالي الخصومات</p>
            <p className="text-2xl font-bold text-destructive">{totalDebits.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">الصافي</p>
            <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
              {netBalance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="text-right py-2 px-2">النوع</th>
                <th className="text-right py-2 px-2">المبلغ</th>
                <th className="text-right py-2 px-2">التاريخ</th>
                <th className="text-right py-2 px-2">الملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-border hover:bg-muted">
                  <td className="py-2 px-2">
                    {transaction.transaction_type === 'deposit' ? (
                      <Badge className="bg-success text-success-foreground flex w-fit gap-1">
                        <ArrowDown className="w-3 h-3" />
                        إيداع
                      </Badge>
                    ) : (
                      <Badge className="bg-destructive text-destructive-foreground flex w-fit gap-1">
                        <ArrowUp className="w-3 h-3" />
                        خصم
                      </Badge>
                    )}
                  </td>
                  <td className="py-2 px-2 font-semibold">{transaction.amount.toFixed(2)}</td>
                  <td className="py-2 px-2">
                    {new Date(transaction.created_at).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="py-2 px-2 text-muted-foreground">{transaction.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedTransactions.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">لا توجد حركات</p>
        )}

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
      </CardContent>
    </Card>
  );
}
