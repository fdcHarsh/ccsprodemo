import { format } from 'date-fns';
import { Download, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { packetHistory } from '@/lib/mockData';
import { toast } from 'sonner';

export default function PacketHistoryPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Packet History</h1>
        <p className="text-muted-foreground">View all previously generated credentialing packets</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Generated Packets
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Packet Name</TableHead>
                <TableHead>Payer</TableHead>
                <TableHead>Date Generated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packetHistory.map(packet => (
                <TableRow key={packet.id}>
                  <TableCell className="font-medium">{packet.name}</TableCell>
                  <TableCell>{packet.payer}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(packet.generatedDate), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={packet.status === 'Submitted' ? 'default' : 'secondary'}>
                      {packet.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success(`Download initiated for ${packet.name}.`)}
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
