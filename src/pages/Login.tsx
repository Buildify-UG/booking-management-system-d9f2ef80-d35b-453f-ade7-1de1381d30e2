import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { login } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(username, password);
      setUser(user);
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'خطأ في تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">نظام الحجوزات</CardTitle>
          <CardDescription>تسجيل الدخول إلى النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                disabled={isLoading}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? 'جاري التحميل...' : 'تسجيل الدخول'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
