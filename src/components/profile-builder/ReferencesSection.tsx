import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormSelect } from './FormFields';
import { ReferencesSection as ReferencesSectionType, Reference, US_STATES } from '@/types/lhl234Profile';
import { Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface ReferencesSectionProps {
  data: ReferencesSectionType;
  onChange: (data: Partial<ReferencesSectionType>) => void;
}

const emptyReference: Reference = {
  nameTitle: '', phone: '', address: '', city: '', state: '', postalCode: '',
};

export function ReferencesSectionComponent({ data, onChange }: ReferencesSectionProps) {
  const updateRef = (index: number, field: keyof Reference, value: string) => {
    const updated = [...data.references];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ references: updated });
  };

  const addRef = () => {
    onChange({ references: [...data.references, { ...emptyReference }] });
  };

  const removeRef = (index: number) => {
    if (data.references.length <= 3) return; // Minimum 3 required
    onChange({ references: data.references.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          Provide at least 3 peer references who can attest to your professional competence. 
          References must be from practitioners in the same professional discipline who have 
          observed your work, are not relatives, and are not current practice partners.
        </AlertDescription>
      </Alert>

      {data.references.map((ref, index) => (
        <Card key={index} className={index < 3 ? 'border-primary/30' : 'border-dashed'}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Reference #{index + 1}
                {index < 3 && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">REQUIRED</span>
                )}
              </CardTitle>
              {index >= 3 && (
                <Button variant="ghost" size="sm" onClick={() => removeRef(index)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Name & Title"
                id={`ref_name_${index}`}
                value={ref.nameTitle}
                onChange={(v) => updateRef(index, 'nameTitle', v)}
                placeholder="Dr. John Smith, MD"
                required
                className="md:col-span-2"
              />
              <FormField
                label="Phone"
                id={`ref_phone_${index}`}
                value={ref.phone}
                onChange={(v) => updateRef(index, 'phone', v)}
                placeholder="(xxx) xxx-xxxx"
                type="tel"
                required
              />
              <FormField
                label="Email"
                id={`ref_email_${index}`}
                value={ref.email || ''}
                onChange={(v) => updateRef(index, 'email', v)}
                placeholder="email@example.com"
                type="email"
              />
              <FormField
                label="Address"
                id={`ref_addr_${index}`}
                value={ref.address}
                onChange={(v) => updateRef(index, 'address', v)}
                placeholder="Street address"
                required
                className="md:col-span-2"
              />
              <FormField
                label="City"
                id={`ref_city_${index}`}
                value={ref.city}
                onChange={(v) => updateRef(index, 'city', v)}
                placeholder="City"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="State"
                  id={`ref_state_${index}`}
                  value={ref.state}
                  onChange={(v) => updateRef(index, 'state', v)}
                  options={US_STATES}
                  required
                />
                <FormField
                  label="ZIP"
                  id={`ref_zip_${index}`}
                  value={ref.postalCode}
                  onChange={(v) => updateRef(index, 'postalCode', v)}
                  placeholder="ZIP"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={addRef} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Additional Reference
      </Button>
    </div>
  );
}
