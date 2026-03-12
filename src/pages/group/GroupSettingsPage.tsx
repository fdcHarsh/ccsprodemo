import { useState } from 'react';
import { Users, CreditCard, Bell, Save, UserPlus, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { GROUP_INFO } from '@/lib/mockData';
import { InviteProviderDialog } from '@/components/InviteProviderDialog';

export default function GroupSettingsPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [groupName, setGroupName] = useState(GROUP_INFO.name);
  const [npi, setNpi] = useState(GROUP_INFO.npi);
  const [address, setAddress] = useState(GROUP_INFO.address);
  const [phone, setPhone] = useState(GROUP_INFO.phone);
  const [primaryContact, setPrimaryContact] = useState(GROUP_INFO.primaryContact);

  const [emailExpiring, setEmailExpiring] = useState(true);
  const [emailRequests, setEmailRequests] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);

  const saveProfile = () => {
    toast.success('Group profile saved.', { description: `${groupName} updated successfully.` });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Group Settings</h1>
        <p className="text-muted-foreground">Manage organization profile, billing, and team preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Group Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Group Name</Label>
              <Input value={groupName} onChange={e => setGroupName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>NPI</Label>
              <Input value={npi} onChange={e => setNpi(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Primary Contact</Label>
                <Input value={primaryContact} onChange={e => setPrimaryContact(e.target.value)} />
              </div>
            </div>
            <Button className="btn-primary-gradient" onClick={saveProfile}>
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Plan:</span>
              <Badge>{GROUP_INFO.plan}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Renewal date: <span className="text-foreground font-medium">{GROUP_INFO.billingRenewal}</span></p>
            <p className="text-sm text-muted-foreground">Providers included: <span className="text-foreground font-medium">{GROUP_INFO.providersIncluded}</span></p>
            <p className="text-sm text-muted-foreground">Current usage: <span className="text-foreground font-medium">{GROUP_INFO.currentUsage}</span></p>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-block">
                  <Button disabled variant="outline">Manage Billing</Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>Contact support to change plans</TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Email alert preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
            <Label htmlFor="notif-expiring">Email alerts for expiring credentials</Label>
            <Switch id="notif-expiring" checked={emailExpiring} onCheckedChange={setEmailExpiring} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
            <Label htmlFor="notif-requests">Email alerts for document requests</Label>
            <Switch id="notif-requests" checked={emailRequests} onCheckedChange={setEmailRequests} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
            <Label htmlFor="notif-weekly">Weekly compliance summary email</Label>
            <Switch id="notif-weekly" checked={weeklySummary} onCheckedChange={setWeeklySummary} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage admins and staff access</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Invite Team Member
          </Button>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Maria Gonzalez</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell><span className="status-badge status-current text-xs">Active</span></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InviteProviderDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
