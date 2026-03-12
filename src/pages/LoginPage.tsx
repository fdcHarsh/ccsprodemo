import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Stethoscope, Users, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import ccsLogo from '@/assets/ccs-logo.png';
import { toast } from 'sonner';

const DEMO_PROVIDER = { email: 'sarah.chen@austinrmc.com', password: 'demo1234' };
const DEMO_GROUP_ADMIN = { email: 'maria.gonzalez@austinrmc.com', password: 'demo1234' };

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginAsProvider, loginAsGroupAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'provider' | 'group_admin' | null>(null);

  const handleAutoFill = (role: 'provider' | 'group_admin') => {
    setSelectedRole(role);
    if (role === 'provider') {
      setEmail(DEMO_PROVIDER.email);
      setPassword(DEMO_PROVIDER.password);
    } else {
      setEmail(DEMO_GROUP_ADMIN.email);
      setPassword(DEMO_GROUP_ADMIN.password);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));

    if (email === DEMO_PROVIDER.email || selectedRole === 'provider') {
      loginAsProvider();
      toast.success('Welcome back, Sarah!', { description: 'Viewing provider dashboard.' });
      navigate('/dashboard');
    } else {
      loginAsGroupAdmin();
      toast.success('Welcome back, Maria!', { description: 'Viewing group admin dashboard.' });
      navigate('/group/dashboard');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <img src={ccsLogo} alt="CCS Pro" className="h-10 w-auto object-contain" />
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-foreground">Signing you in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <img src={ccsLogo} alt="CCS Pro" className="h-9 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">CCS Pro</h1>
              <p className="text-primary-foreground/70 text-sm">Credentialing Services</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-primary-foreground leading-tight mb-4">
            Healthcare Credentialing,<br />Simplified.
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-md">
            Manage your Texas credentialing profile, track expirations, and generate payer-ready packets — all in one place.
          </p>
          <div className="space-y-4">
            {[
              { icon: ShieldCheck, text: 'CAQH ProView attestation tracking' },
              { icon: FileText, text: 'LHL234 Texas Standard Application' },
              { icon: CheckCircle2, text: 'Automated pre-flight compliance checks' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-primary-foreground/90">
                <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative">
        <Badge variant="secondary" className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold bg-warning/15 text-warning border border-warning/30">
          Demo Mode
        </Badge>

        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center shadow-lg mb-3">
            <img src={ccsLogo} alt="CCS Pro" className="h-9 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">CCS Pro</h1>
          <p className="text-muted-foreground text-sm">Healthcare Credentialing, Simplified.</p>
        </div>

        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-1">Sign in</h2>
            <p className="text-sm text-muted-foreground mb-6">Enter your credentials to access your account</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <Button
                className="w-full btn-primary-gradient"
                onClick={handleLogin}
                disabled={!email || !password}
              >
                Login
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground uppercase tracking-wider">Demo Accounts</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                className={`flex items-center gap-2 h-auto py-3 ${selectedRole === 'provider' ? 'border-primary ring-2 ring-primary/20' : ''}`}
                onClick={() => handleAutoFill('provider')}
              >
                <Stethoscope className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-semibold">Login as Provider</p>
                  <p className="text-[10px] text-muted-foreground">Sarah Chen, CRNA</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className={`flex items-center gap-2 h-auto py-3 ${selectedRole === 'group_admin' ? 'border-secondary ring-2 ring-secondary/20' : ''}`}
                onClick={() => handleAutoFill('group_admin')}
              >
                <Users className="h-4 w-4 text-secondary flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-semibold">Login as Group Admin</p>
                  <p className="text-[10px] text-muted-foreground">Maria Gonzalez</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          CCS Pro is a product of CACS LLC. Built for Texas healthcare providers.
        </footer>
      </div>
    </div>
  );
}
