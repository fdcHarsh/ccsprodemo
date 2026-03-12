import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle2, Clock, XCircle, ExternalLink, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { providerGroupMemberships, GroupMembership, groupActivityLog, groupCredentialingStatuses } from '@/lib/mockData';

type ConsentStatus = GroupMembership['consentStatus'];

const statusBadge = (status: ConsentStatus) => {
  if (status === 'Active') return <span className="status-badge status-current">Active</span>;
  if (status === 'Pending Consent') return <span className="status-badge status-expiring">Pending Consent</span>;
  return <span className="status-badge status-expired">Revoked</span>;
};

export default function MyGroupsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState(providerGroupMemberships);
  const [reviewGroup, setReviewGroup] = useState<GroupMembership | null>(null);
  const [revokeGroup, setRevokeGroup] = useState<GroupMembership | null>(null);
  const [viewGroup, setViewGroup] = useState<GroupMembership | null>(null);

  const handleGrantConsent = () => {
    if (!reviewGroup) return;
    setGroups(prev => prev.map(g =>
      g.id === reviewGroup.id ? { ...g, consentStatus: 'Active', dateJoined: new Date().toISOString().split('T')[0] } : g
    ));
    toast.success('Consent granted.', { description: `${reviewGroup.groupName} can now view your profile.` });
    setReviewGroup(null);
  };

  const handleRevoke = () => {
    if (!revokeGroup) return;
    setGroups(prev => prev.map(g =>
      g.id === revokeGroup.id ? { ...g, consentStatus: 'Revoked', dateJoined: null } : g
    ));
    toast.success('Consent revoked.', { description: `${revokeGroup.groupName} can no longer access your profile.` });
    setRevokeGroup(null);
  };

  const handleDecline = (group: GroupMembership) => {
    setGroups(prev => prev.map(g => g.id === group.id ? { ...g, consentStatus: 'Revoked' } : g));
    toast.info('Request declined.');
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Groups</h1>
        <p className="text-muted-foreground">Manage your group memberships and control which organizations can access your credentialing profile.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5" /> Group Memberships ({groups.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Consent Status</TableHead>
                <TableHead>Date Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map(group => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.groupName}</TableCell>
                  <TableCell className="text-muted-foreground">{group.role}</TableCell>
                  <TableCell>{statusBadge(group.consentStatus)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {group.dateJoined ? new Date(group.dateJoined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {group.consentStatus === 'Active' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => setViewGroup(group)}>View Group</Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setRevokeGroup(group)}>Revoke Consent</Button>
                        </>
                      )}
                      {group.consentStatus === 'Pending Consent' && (
                        <>
                          <Button size="sm" className="btn-primary-gradient" onClick={() => setReviewGroup(group)}>Review Request</Button>
                          <Button variant="outline" size="sm" onClick={() => handleDecline(group)}>Decline</Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Group Dialog */}
      <Dialog open={!!viewGroup} onOpenChange={open => !open && setViewGroup(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewGroup?.groupName}</DialogTitle>
            <DialogDescription>{viewGroup?.address}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Activity className="h-4 w-4" /> Activity Log</h3>
              <div className="space-y-2">
                {groupActivityLog.map(item => (
                  <div key={item.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{item.description}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Credentialing Status Summary</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupCredentialingStatuses.map(row => (
                    <TableRow key={row.payer}>
                      <TableCell className="font-medium">{row.payer}</TableCell>
                      <TableCell>
                        <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>{row.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{row.lastUpdated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewGroup(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Request Modal */}
      <Dialog open={!!reviewGroup} onOpenChange={open => !open && setReviewGroup(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Consent Request</DialogTitle>
            <DialogDescription>Review access request from this organization</DialogDescription>
          </DialogHeader>
          {reviewGroup && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="font-semibold">{reviewGroup.groupName}</p>
                <p className="text-sm text-muted-foreground">{reviewGroup.address}</p>
                <p className="text-sm text-muted-foreground">{reviewGroup.credentialingManager}</p>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {reviewGroup.groupName} is requesting access to your credentialing profile to manage submissions on your behalf. You can revoke this consent at any time.
              </p>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setReviewGroup(null)}>Decline</Button>
                <Button className="btn-primary-gradient" onClick={handleGrantConsent}>Grant Consent</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke Consent Alert */}
      <AlertDialog open={!!revokeGroup} onOpenChange={open => !open && setRevokeGroup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Consent?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke consent for {revokeGroup?.groupName}? They will no longer be able to access your credentialing profile or generate packets on your behalf.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleRevoke}>Revoke Consent</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
