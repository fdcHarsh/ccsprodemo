import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from './FormFields';
import { AttestationSection } from '@/types/lhl234Profile';
import { FileSignature } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AuthorizationSignatureSectionProps {
  data: AttestationSection;
  onChange: (field: keyof AttestationSection, value: string) => void;
}

export function AuthorizationSignatureSectionComponent({ data, onChange }: AuthorizationSignatureSectionProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <FileSignature className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Section III — Authorization, Attestation and Release:</strong> Complete all fields below.
          Your initials and signature confirm that the information in this application is accurate.
        </AlertDescription>
      </Alert>

      {/* Applying Entities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-primary" />
            Applying Entities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Please indicate the managed care company(s) or hospital(s) to which you are applying
            </Label>
            <Textarea
              value={data.applyingEntities}
              onChange={(e) => onChange('applyingEntities', e.target.value)}
              placeholder="List the managed care companies or hospitals..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Applicant Initials and Date */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Applicant Initials and Date</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg border text-sm text-muted-foreground">
            By initialing below, you acknowledge that you have read and agree to the Authorization,
            Attestation and Release on this page.
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Initials"
              id="initialsPage11"
              value={data.initialsPage11}
              onChange={(v) => onChange('initialsPage11', v)}
              placeholder="e.g., JS"
              maxLength={5}
              required
            />
            <FormField
              label="Date"
              id="initialsDate"
              value={data.initialsDate}
              onChange={(v) => onChange('initialsDate', v)}
              type="date"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Signature Block */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg border text-sm text-muted-foreground">
            I certify that all information provided in my application is true, correct, and complete
            to the best of my knowledge and belief.
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Signature (type your full legal name to sign)"
              id="signature"
              value={data.signature}
              onChange={(v) => onChange('signature', v)}
              placeholder="Full legal name"
              required
              className="md:col-span-2"
            />
            <FormField
              label="Name (please print or type)"
              id="printedName"
              value={data.printedName}
              onChange={(v) => onChange('printedName', v)}
              placeholder="Printed name"
              required
            />
            <FormField
              label="Last 4 digits of SSN or NPI"
              id="last4SsnOrNpi"
              value={data.last4SsnOrNpi}
              onChange={(v) => onChange('last4SsnOrNpi', v)}
              placeholder="1234"
              maxLength={4}
              required
            />
            <FormField
              label="Date"
              id="signatureDate"
              value={data.signatureDate}
              onChange={(v) => onChange('signatureDate', v)}
              type="date"
              required
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
