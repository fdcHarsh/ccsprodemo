import { useState } from 'react';
import { format } from 'date-fns';
import { BookOpen, Plus, FileText, Download, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUI } from '@/contexts/UIContext';
import { toast } from 'sonner';

export default function CMETrackerPage() {
  const { cmeCourses, addCMECourse, deleteCMECourse } = useUI();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', provider: '', completionDate: '', credits: '', category: 'cat1' as const });

  const cat1 = cmeCourses.filter(c => c.category === 'cat1').reduce((s, c) => s + c.credits, 0);
  const cat2 = cmeCourses.filter(c => c.category === 'cat2').reduce((s, c) => s + c.credits, 0);
  const ethics = cmeCourses.filter(c => c.category === 'ethics').reduce((s, c) => s + c.credits, 0);
  const total = cat1 + cat2 + ethics;

  const handleAdd = () => {
    if (!newCourse.name || !newCourse.credits) { toast.error('Fill required fields'); return; }
    addCMECourse({ id: crypto.randomUUID(), ...newCourse, credits: parseFloat(newCourse.credits), certificateUploaded: false });
    setDialogOpen(false);
    setNewCourse({ name: '', provider: '', completionDate: '', credits: '', category: 'cat1' });
    toast.success('CME course added!');
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">CME Tracker</h1><p className="text-muted-foreground">Track your continuing medical education credits</p></div>
        <Button onClick={() => setDialogOpen(true)} className="btn-primary-gradient"><Plus className="mr-2 h-4 w-4" />Add Course</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-hover"><CardContent className="p-4"><p className="text-3xl font-bold text-primary">{total}<span className="text-lg text-muted-foreground">/50</span></p><Progress value={(total/50)*100} className="mt-2" /><p className="text-xs text-muted-foreground mt-1">Total Credits</p></CardContent></Card>
        <Card className="card-hover"><CardContent className="p-4"><p className="text-2xl font-bold">{cat1}<span className="text-sm text-muted-foreground">/30</span></p><p className="text-xs text-muted-foreground">Category 1</p></CardContent></Card>
        <Card className="card-hover"><CardContent className="p-4"><p className="text-2xl font-bold">{cat2}<span className="text-sm text-muted-foreground">/15</span></p><p className="text-xs text-muted-foreground">Category 2</p></CardContent></Card>
        <Card className="card-hover"><CardContent className="p-4"><p className="text-2xl font-bold">{ethics}<span className="text-sm text-muted-foreground">/5</span></p><p className="text-xs text-muted-foreground">Ethics</p></CardContent></Card>
      </div>

      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Provider</TableHead><TableHead>Date</TableHead><TableHead>Credits</TableHead><TableHead>Category</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {cmeCourses.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.provider}</TableCell>
                <TableCell>{format(new Date(c.completionDate), 'MMM d, yyyy')}</TableCell>
                <TableCell>{c.credits}</TableCell>
                <TableCell><span className="status-badge status-current">{c.category === 'cat1' ? 'Cat 1' : c.category === 'cat2' ? 'Cat 2' : 'Ethics'}</span></TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => { deleteCMECourse(c.id); toast.success('Deleted'); }}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add CME Course</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Course Name *</Label><Input value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Provider</Label><Input value={newCourse.provider} onChange={e => setNewCourse({...newCourse, provider: e.target.value})} /></div>
              <div className="space-y-2"><Label>Credits *</Label><Input type="number" value={newCourse.credits} onChange={e => setNewCourse({...newCourse, credits: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={newCourse.completionDate} onChange={e => setNewCourse({...newCourse, completionDate: e.target.value})} /></div>
              <div className="space-y-2"><Label>Category</Label><Select value={newCourse.category} onValueChange={v => setNewCourse({...newCourse, category: v as any})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cat1">Category 1</SelectItem><SelectItem value="cat2">Category 2</SelectItem><SelectItem value="ethics">Ethics</SelectItem></SelectContent></Select></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleAdd} className="btn-primary-gradient">Add Course</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
