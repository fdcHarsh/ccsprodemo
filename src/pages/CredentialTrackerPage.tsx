import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useCredentials } from '@/contexts/CredentialsContext';
import { credentialTypes, type Credential } from '@/lib/mockData';
import { getRenewalInfo } from '@/lib/renewalLinks';
import { RenewalDialog } from '@/components/credentials/RenewalDialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const RENEWAL_STORAGE_KEY = 'credflow_renewal_status';

export default function CredentialTrackerPage() {
  const { credentials, deleteCredential, updateCredential } = useCredentials();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [renewalDialogOpen, setRenewalDialogOpen] = useState(false);
  const [renewalCredential, setRenewalCredential] = useState<Credential | null>(null);

  // Export Documents dialog
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportSelected, setExportSelected] = useState<string[]>([]);

  // View Details dialog
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [viewCredential, setViewCredential] = useState<Credential | null>(null);

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCredential, setEditCredential] = useState<Credential | null>(null);
  const [editForm, setEditForm] = useState({ name: '', expirationDate: '', issuingOrganization: '' });

  // Renewal status persistence
  const [renewalStatus, setRenewalStatus] = useState<Record<string, 'in-progress' | 'completed'>>(() => {
    const stored = localStorage.getItem(RENEWAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem(RENEWAL_STORAGE_KEY, JSON.stringify(renewalStatus));
  }, [renewalStatus]);

  const handleMarkRenewal = (id: string) => {
    setRenewalStatus((prev) => {
      const current = prev[id];
      if (!current) {
        toast.success('Renewal marked as in progress');
        return { ...prev, [id]: 'in-progress' };
      }
      if (current === 'in-progress') {
        toast.success('Renewal marked as completed');
        return { ...prev, [id]: 'completed' };
      }
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const filteredCredentials = useMemo(() => {
    let filtered = [...credentials];
    if (searchQuery) {
      filtered = filtered.filter(
        (cred) =>
          cred.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cred.issuingOrganization.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter((cred) => cred.type === typeFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((cred) => cred.status === statusFilter);
    }
    filtered.sort((a, b) => a.daysLeft - b.daysLeft);
    return filtered;
  }, [credentials, searchQuery, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const urgent = credentials.filter((c) => c.status === 'urgent').length;
    const expiring = credentials.filter((c) => c.status === 'expiring').length;
    const current = credentials.filter((c) => c.status === 'current').length;
    const inProgress = Object.values(renewalStatus).filter((s) => s === 'in-progress').length;
    return { urgent, expiring, current, total: credentials.length, inProgress };
  }, [credentials, renewalStatus]);

  const handleDelete = () => {
    if (selectedCredential) {
      deleteCredential(selectedCredential.id);
      toast.success('Credential deleted');
      setDeleteDialogOpen(false);
      setSelectedCredential(null);
    }
  };

  const handleExportSelected = () => {
    toast.success(`Export initiated for ${exportSelected.length} documents`);
    setExportDialogOpen(false);
    setExportSelected([]);
  };

  const openEdit = (cred: Credential) => {
    setEditCredential(cred);
    setEditForm({
      name: cred.name,
      expirationDate: cred.expirationDate,
      issuingOrganization: cred.issuingOrganization,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editCredential) {
      updateCredential(editCredential.id, {
        name: editForm.name,
        expirationDate: editForm.expirationDate,
        issuingOrganization: editForm.issuingOrganization,
      });
      toast.success('Credential updated');
      setEditDialogOpen(false);
      setEditCredential(null);
    }
  };

  const getStatusIcon = (status: string, credId?: string) => {
    const rs = credId ? renewalStatus[credId] : undefined;
    if (rs === 'in-progress') return <RefreshCw className="h-4 w-4 text-warning animate-spin" style={{ animationDuration: '3s' }} />;
    switch (status) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'expiring': return <Clock className="h-4 w-4 text-warning" />;
      default: return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
  };

  const getStatusBadge = (status: string, credId?: string) => {
    const rs = credId ? renewalStatus[credId] : undefined;
    const classes = 'status-badge';
    if (rs === 'in-progress') return <span className={cn(classes, 'bg-warning/10 text-warning')}>Renewing</span>;
    if (rs === 'completed') return <span className={cn(classes, 'bg-success/10 text-success')}>Renewed</span>;
    switch (status) {
      case 'current': return <span className={cn(classes, 'status-current')}>Current</span>;
      case 'expiring': return <span className={cn(classes, 'status-expiring')}>Expiring Soon</span>;
      case 'urgent': return <span className={cn(classes, 'status-urgent')}>Urgent</span>;
      case 'expired': return <span className={cn(classes, 'status-expired')}>Expired</span>;
      default: return null;
    }
  };

  const getTypeLabel = (type: string) => {
    return credentialTypes.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Credential Tracker</h1>
          <p className="text-muted-foreground">Track and manage all your credentials</p>
        </div>
        <Button variant="outline" onClick={() => { setExportSelected([]); setExportDialogOpen(true); }}>
          <Download className="mr-2 h-4 w-4" />
          Export Documents
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-5">
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.urgent}</p>
                <p className="text-xs text-muted-foreground">Urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.expiring}</p>
                <p className="text-xs text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.current}</p>
                <p className="text-xs text-muted-foreground">Current</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">Renewing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ArrowUpDown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search credentials..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {credentialTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="current">Current</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Credential</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Expiration Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Days Left</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCredentials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <p className="text-muted-foreground">No credentials found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCredentials.map((cred) => {
                const hasRenewalInfo = !!getRenewalInfo(cred.name);
                const showRenewButton = (cred.status === 'urgent' || cred.status === 'expiring') && !renewalStatus[cred.id];

                return (
                  <TableRow key={cred.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(cred.status, cred.id)}
                        <div>
                          <p className="font-medium">{cred.name}</p>
                          <p className="text-xs text-muted-foreground">{cred.issuingOrganization}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeLabel(cred.type)}</TableCell>
                    <TableCell>{format(new Date(cred.expirationDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{getStatusBadge(cred.status, cred.id)}</TableCell>
                    <TableCell>
                      <span className={cn('font-medium', cred.status === 'urgent' && 'text-destructive', cred.status === 'expiring' && 'text-warning', cred.status === 'current' && 'text-success')}>
                        {cred.daysLeft} days
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {showRenewButton && (
                          <Button size="sm" variant="outline" className="text-xs border-warning/30 text-warning hover:bg-warning/10" onClick={() => { setRenewalCredential(cred); setRenewalDialogOpen(true); }}>
                            <RefreshCw className="mr-1 h-3 w-3" /> Renew
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setViewCredential(cred); setViewDetailsOpen(true); }}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            {hasRenewalInfo && (
                              <DropdownMenuItem onClick={() => { setRenewalCredential(cred); setRenewalDialogOpen(true); }}>
                                <RefreshCw className="mr-2 h-4 w-4" /> Renewal Info
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => openEdit(cred)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedCredential(cred); setDeleteDialogOpen(true); }}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Credential</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCredential?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Renewal Dialog */}
      <RenewalDialog
        credential={renewalCredential}
        open={renewalDialogOpen}
        onOpenChange={setRenewalDialogOpen}
        onMarkInProgress={handleMarkRenewal}
        renewalStatus={renewalStatus}
      />

      {/* Export Documents Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Documents</DialogTitle>
            <DialogDescription>Select the documents you want to export.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto py-2">
            {credentials.map((cred) => {
              const checked = exportSelected.includes(cred.id);
              return (
                <label key={cred.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => setExportSelected(prev => checked ? prev.filter(id => id !== cred.id) : [...prev, cred.id])}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cred.name}</p>
                    <p className="text-xs text-muted-foreground">{cred.issuingOrganization}</p>
                  </div>
                  {getStatusBadge(cred.status)}
                </label>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancel</Button>
            <Button className="btn-primary-gradient" disabled={exportSelected.length === 0} onClick={handleExportSelected}>
              Export Selected ({exportSelected.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Credential Details</DialogTitle>
          </DialogHeader>
          {viewCredential && (
            <div className="space-y-3 py-2">
              {[
                { label: 'Name', value: viewCredential.name },
                { label: 'Type', value: getTypeLabel(viewCredential.type) },
                { label: 'Issuing Organization', value: viewCredential.issuingOrganization },
                { label: 'Issue Date', value: format(new Date(viewCredential.issueDate), 'MMM d, yyyy') },
                { label: 'Expiration Date', value: format(new Date(viewCredential.expirationDate), 'MMM d, yyyy') },
                { label: 'Days Remaining', value: `${viewCredential.daysLeft} days` },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Status:</span>
                {getStatusBadge(viewCredential.status)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Credential</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Issuing Organization</Label>
              <Input value={editForm.issuingOrganization} onChange={(e) => setEditForm(f => ({ ...f, issuingOrganization: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Expiration Date</Label>
              <Input type="date" value={editForm.expirationDate} onChange={(e) => setEditForm(f => ({ ...f, expirationDate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button className="btn-primary-gradient" onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
