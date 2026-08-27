import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit2, Plus, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsProps {
  onRefresh: () => void;
}

export default function Settings({ onRefresh }: SettingsProps) {
  const { user } = useAuth();
  const [cities, setCities] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [users, setUsers] = useState([]);
  const [newCity, setNewCity] = useState('');
  const [newRoute, setNewRoute] = useState({ from: '', to: '', price: '' });
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'booking_officer' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [citiesRes, routesRes, usersRes] = await Promise.all([
        supabase.from('cities').select('*').order('name'),
        supabase.from('routes').select('*'),
        supabase.from('app_users').select('*'),
      ]);

      if (citiesRes.data) setCities(citiesRes.data);
      if (routesRes.data) setRoutes(routesRes.data);
      if (usersRes.data) setUsers(usersRes.data);
    } catch (error) {
      toast.error('خطأ في تحميل البيانات');
    }
  };

  // Cities Management
  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('cities').insert([{ name: newCity }]);
      if (error) throw error;
      toast.success('تم إضافة المدينة');
      setNewCity('');
      loadData();
    } catch (error) {
      toast.error('خطأ في إضافة المدينة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCity = async (id: string) => {
    if (!confirm('هل أنت متأكد؟')) return;
    try {
      const { error } = await supabase.from('cities').delete().eq('id', id);
      if (error) throw error;
      toast.success('تم حذف المدينة');
      loadData();
    } catch (error) {
      toast.error('خطأ في حذف المدينة');
    }
  };

  // Routes Management
  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoute.from || !newRoute.to || !newRoute.price) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('routes').insert([
        {
          from_city_id: newRoute.from,
          to_city_id: newRoute.to,
          price: parseFloat(newRoute.price),
        },
      ]);
      if (error) throw error;
      toast.success('تم إضافة الرحلة');
      setNewRoute({ from: '', to: '', price: '' });
      loadData();
    } catch (error) {
      toast.error('خطأ في إضافة الرحلة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm('هل أنت متأكد؟')) return;
    try {
      const { error } = await supabase.from('routes').delete().eq('id', id);
      if (error) throw error;
      toast.success('تم حذف الرحلة');
      loadData();
    } catch (error) {
      toast.error('خطأ في حذف الرحلة');
    }
  };

  // Users Management
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('app_users').insert([
        {
          username: newUser.username,
          password_hash: newUser.password,
          role: newUser.role,
          is_active: true,
        },
      ]);
      if (error) throw error;
      toast.success('تم إضافة المستخدم');
      setNewUser({ username: '', password: '', role: 'booking_officer' });
      loadData();
    } catch (error) {
      toast.error('خطأ في إضافة المستخدم');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUser = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('app_users')
        .update({ is_active: !isActive })
        .eq('id', id);
      if (error) throw error;
      toast.success(isActive ? 'تم تعطيل المستخدم' : 'تم تفعيل المستخدم');
      loadData();
    } catch (error) {
      toast.error('خطأ في تحديث المستخدم');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      const { error } = await supabase.from('app_users').delete().eq('id', id);
      if (error) throw error;
      toast.success('تم حذف المستخدم');
      loadData();
    } catch (error) {
      toast.error('خطأ في حذف المستخدم');
    }
  };

  const getCityName = (cityId: string) => {
    return cities.find((c) => c.id === cityId)?.name || 'غير معروف';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'مدير النظام',
      accountant: 'محاسب',
      booking_officer: 'موظف حجز',
    };
    return labels[role] || role;
  };

  return (
    <Tabs defaultValue="cities" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="cities">المدن</TabsTrigger>
        <TabsTrigger value="routes">الرحلات</TabsTrigger>
        <TabsTrigger value="users">المستخدمين</TabsTrigger>
      </TabsList>

      {/* Cities Tab */}
      <TabsContent value="cities" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>إدارة المدن</CardTitle>
            <CardDescription>إضافة أو حذف المدن والمحافظات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddCity} className="flex gap-2">
              <Input
                placeholder="اسم المدينة"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
              />
              <Button type="submit" disabled={isLoading}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة
              </Button>
            </form>

            <div className="space-y-2">
              {cities.map((city) => (
                <div key={city.id} className="flex items-center justify-between p-2 border border-border rounded">
                  <span>{city.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCity(city.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Routes Tab */}
      <TabsContent value="routes" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>إدارة الرحلات</CardTitle>
            <CardDescription>تحديد أسعار الرحلات بين المدن</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddRoute} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Select value={newRoute.from} onValueChange={(value) => setNewRoute({ ...newRoute, from: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="من" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={newRoute.to} onValueChange={(value) => setNewRoute({ ...newRoute, to: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="إلى" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  step="0.01"
                  placeholder="السعر"
                  value={newRoute.price}
                  onChange={(e) => setNewRoute({ ...newRoute, price: e.target.value })}
                />

                <Button type="submit" disabled={isLoading}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة
                </Button>
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-right py-2 px-2">من</th>
                    <th className="text-right py-2 px-2">إلى</th>
                    <th className="text-right py-2 px-2">السعر</th>
                    <th className="text-right py-2 px-2">الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route) => (
                    <tr key={route.id} className="border-b border-border">
                      <td className="py-2 px-2">{getCityName(route.from_city_id)}</td>
                      <td className="py-2 px-2">{getCityName(route.to_city_id)}</td>
                      <td className="py-2 px-2 font-semibold">{route.price}</td>
                      <td className="py-2 px-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRoute(route.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Users Tab */}
      <TabsContent value="users" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>إدارة المستخدمين</CardTitle>
            <CardDescription>إضافة أو تعديل أو تعطيل المستخدمين</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddUser} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input
                  placeholder="اسم المستخدم"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
                <Input
                  type="password"
                  placeholder="كلمة المرور"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مدير النظام</SelectItem>
                    <SelectItem value="accountant">محاسب</SelectItem>
                    <SelectItem value="booking_officer">موظف حجز</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" disabled={isLoading}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة
                </Button>
              </div>
            </form>

            <div className="space-y-2">
              {users.map((appUser) => (
                <div key={appUser.id} className="flex items-center justify-between p-3 border border-border rounded">
                  <div>
                    <p className="font-semibold">{appUser.username}</p>
                    <p className="text-sm text-muted-foreground">{getRoleLabel(appUser.role)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={appUser.is_active ? 'default' : 'secondary'}>
                      {appUser.is_active ? 'نشط' : 'معطل'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleUser(appUser.id, appUser.is_active)}
                    >
                      {appUser.is_active ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </Button>
                    {appUser.id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(appUser.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
