import { useState } from 'react';
import { Bell, CreditCard, User, Shield, AlertTriangle, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { providerUser } from '@/lib/mockData';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsDeleting(false);
    setDeleteConfirmOpen(false);
    setDeleteConfirmText('');
    toast.success('Account deleted. Goodbye!');
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Account Information</CardTitle>
          <CardDescription>Your account details (read-only in demo)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <Input value={providerUser.name} readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input value={providerUser.email} readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Phone Number</Label>
              <Input value={providerUser.phone || '(512) 555-0101'} readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Address</Label>
              <Input value={providerUser.address || '4821 Brodie Lane, Suite 200'} readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">City</Label>
              <Input value={providerUser.city || 'Austin'} readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">State</Label>
              <Input value={providerUser.state || 'TX'} readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Zip Code</Label>
              <Input value={providerUser.zip || '78745'} readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Country</Label>
              <Input value={providerUser.country || 'United States'} readOnly className="bg-muted/50" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-muted-foreground">Password</Label>
              <Input value="••••••••••••" readOnly className="bg-muted/50" type="password" />
            </div>
            <Button variant="outline" disabled className="mt-5 opacity-50">
              <Lock className="mr-1.5 h-3.5 w-3.5" /> Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><Label>Email Alerts</Label><p className="text-sm text-muted-foreground">Receive expiration reminders via email</p></div>
            <Switch defaultChecked />
          </div>
          <div className="space-y-2">
            <Label>Alert Timing</Label>
            <Select defaultValue="30">
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90 days before</SelectItem>
                <SelectItem value="60">60 days before</SelectItem>
                <SelectItem value="30">30 days before</SelectItem>
                <SelectItem value="14">14 days before</SelectItem>
                <SelectItem value="7">7 days before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div><p className="font-semibold">Provider Pro</p><p className="text-sm text-muted-foreground">$99/year • Renews March 15, 2027</p></div>
            <span className="status-badge status-current">Active</span>
          </div>
          <div className="flex items-center justify-between"><span className="text-sm">Payment Method</span><span className="text-sm text-muted-foreground">Visa ending in 4242</span></div>
          <Button variant="outline">Manage Subscription</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={() => toast.success('Data exported!')}>Export All Data</Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /> Danger Zone</CardTitle>
          <CardDescription>These actions are irreversible. Please proceed with caution.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogTrigger asChild><Button variant="destructive">Delete Account</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Delete Your Account?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>This action is <strong>irreversible</strong>. All your data will be permanently erased.</p>
                  <p>To confirm, please type <strong>DELETE</strong> below:</p>
                  <Input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="Type DELETE to confirm" className="mt-2" />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'DELETE' || isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
