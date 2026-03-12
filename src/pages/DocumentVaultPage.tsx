import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Search, Filter, Grid, List, FileText, Trash2, Download, Eye, FolderOpen, Plus, Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useDocuments } from '@/contexts/DocumentsContext';
import { useCredentials } from '@/contexts/CredentialsContext';
import { documentCategories, calculateStatus, type Document, type Credential } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function categoryToCredType(cat: string): Credential['type'] {
  if (cat.toLowerCase().includes('license')) return 'license';
  if (cat.toLowerCase().includes('certification') || cat.toLowerCase().includes('certificate')) return 'certification';
  if (cat.toLowerCase().includes('insurance')) return 'insurance';
  return 'certification';
}

function inferIssuer(name: string, category: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('texas') && lower.includes('license')) return 'Texas Board of Nursing';
  if (lower.includes('dea')) return 'U.S. Drug Enforcement Administration';
  if (lower.includes('nbcrna') || lower.includes('crna')) return 'NBCRNA';
  if (lower.includes('npi')) return 'CMS / NPPES';
  if (lower.includes('malpractice') || lower.includes('insurance') || lower.includes('liability')) return 'Insurance Carrier';
  if (lower.includes('caqh')) return 'CAQH';
  return 'Issuing Organization';
}

export default function DocumentVaultPage() {
  const { documents, addDocument, deleteDocument } = useDocuments();
  const { addCredential } = useCredentials();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [newDocument, setNewDocument] = useState({
    name: '',
    category: documentCategories[0]?.value || '',
    expirationDate: '',
  });

  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];
    if (searchQuery) {
      filtered = filtered.filter((doc) => doc.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((doc) => doc.category === categoryFilter);
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'date': return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'category': return a.category.localeCompare(b.category);
        case 'expiration':
          if (!a.expirationDate) return 1;
          if (!b.expirationDate) return -1;
          return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
        default: return 0;
      }
    });
    return filtered;
  }, [documents, searchQuery, categoryFilter, sortBy]);

  const handleUpload = () => {
    if (!newDocument.name) { toast.error('Please enter a document name'); return; }
    const docId = crypto.randomUUID();
    const status = newDocument.expirationDate ? calculateStatus(newDocument.expirationDate).status : 'current' as const;
    const doc: Document = {
      id: docId,
      name: newDocument.name,
      category: newDocument.category,
      uploadDate: format(new Date(), 'yyyy-MM-dd'),
      expirationDate: newDocument.expirationDate || null,
      status,
      fileType: 'PDF',
      fileSize: `${Math.floor(Math.random() * 500 + 100)} KB`,
    };
    addDocument(doc);
    if (newDocument.expirationDate) {
      const { daysLeft } = calculateStatus(newDocument.expirationDate);
      const cred: Credential = {
        id: `cred-auto-${docId}`,
        name: newDocument.name,
        type: categoryToCredType(newDocument.category),
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        expirationDate: newDocument.expirationDate,
        issuingOrganization: inferIssuer(newDocument.name, newDocument.category),
        status,
        daysLeft,
        documentId: docId,
      };
      addCredential(cred);
      toast.success('Document uploaded & credential tracked automatically!');
    } else {
      toast.success('Document uploaded successfully!');
    }
    setUploadDialogOpen(false);
    setNewDocument({ name: '', category: documentCategories[0]?.value || '', expirationDate: '' });
  };

  const handleDelete = () => {
    if (selectedDoc) {
      deleteDocument(selectedDoc.id);
      toast.success('Document deleted');
      setDeleteDialogOpen(false);
      setSelectedDoc(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = 'status-badge';
    switch (status) {
      case 'current': return <span className={cn(classes, 'status-current')}>Current</span>;
      case 'expiring': return <span className={cn(classes, 'status-expiring')}>Expiring Soon</span>;
      case 'urgent': return <span className={cn(classes, 'status-urgent')}>Urgent</span>;
      case 'expired': return <span className={cn(classes, 'status-expired')}>Expired</span>;
      default: return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    return documentCategories.find((c) => c.value === category)?.label || category;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Document Vault</h1>
          <p className="text-muted-foreground">Store and manage all your credentials and documents</p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)} className="btn-primary-gradient">
          <Upload className="mr-2 h-4 w-4" /> Upload Document
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[220px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {documentCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="date">Upload Date</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="expiration">Expiration</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1 border rounded-lg p-1">
              <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredDocuments.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-4">Upload your first credential to get started</p>
            <Button onClick={() => setUploadDialogOpen(true)} className="btn-primary-gradient">
              <Plus className="mr-2 h-4 w-4" /> Upload Document
            </Button>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="card-hover group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setSelectedDoc(doc); setDeleteDialogOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-medium text-sm truncate mb-1">{doc.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{getCategoryLabel(doc.category)}</p>
                <div className="flex items-center justify-between">
                  {doc.expirationDate ? getStatusBadge(doc.status) : <span className="text-xs text-muted-foreground">No expiration</span>}
                  <span className="text-xs text-muted-foreground">{doc.fileSize}</span>
                </div>
                {doc.expirationDate && (
                  <p className="text-xs text-muted-foreground mt-2">Expires: {format(new Date(doc.expirationDate), 'MMM d, yyyy')}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="divide-y">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{doc.name}</h3>
                    <p className="text-xs text-muted-foreground">{getCategoryLabel(doc.category)} • {doc.fileSize} • Uploaded {format(new Date(doc.uploadDate), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {doc.expirationDate && (
                    <div className="text-right">
                      {getStatusBadge(doc.status)}
                      <p className="text-xs text-muted-foreground mt-1">Expires {format(new Date(doc.expirationDate), 'MMM d, yyyy')}</p>
                    </div>
                  )}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setSelectedDoc(doc); setDeleteDialogOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Add a new document to your credential vault</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Drag and drop your file here, or click to browse</p>
              <p className="text-xs text-muted-foreground">PDF, PNG, JPG up to 10MB</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="docName">Document Name</Label>
              <Input id="docName" placeholder="e.g., State RN License" value={newDocument.name} onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={newDocument.category} onValueChange={(value) => setNewDocument({ ...newDocument, category: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {documentCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Categories reflect standard Texas credentialing requirements. Requirements may vary by payer.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiration">Expiration Date (optional)</Label>
              <Input id="expiration" type="date" value={newDocument.expirationDate} onChange={(e) => setNewDocument({ ...newDocument, expirationDate: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} className="btn-primary-gradient">Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{selectedDoc?.name}"? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
