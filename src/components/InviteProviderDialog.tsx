import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface InviteProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_MESSAGE = `You have been invited to join Austin Regional Medical Group on CCS Pro. Please complete your profile and grant consent to allow us to manage your credentialing submissions.`;

export function InviteProviderDialog({ open, onOpenChange }: InviteProviderDialogProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Invitation sent!', {
      description: `${email} — The provider will appear on your roster once they accept.`,
    });
    setSending(false);
    setEmail('');
    setMessage(DEFAULT_MESSAGE);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite Provider</DialogTitle>
          <DialogDescription>
            Send an invitation to a provider to join Austin Regional Medical Group.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Provider Email Address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="provider@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-message">Message (Optional)</Label>
            <Textarea
              id="invite-message"
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              className="btn-primary-gradient"
              onClick={handleSend}
              disabled={!email || sending}
            >
              {sending ? 'Sending…' : 'Send Invitation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
