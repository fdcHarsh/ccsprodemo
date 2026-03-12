import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from './FormFields';
import { CallCoverageSection as CallCoverageSectionType, CallCoverageColleague } from '@/types/lhl234Profile';
import { Phone, Plus, Trash2, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CallCoverageSectionProps {
  data: CallCoverageSectionType;
  onChange: (data: Partial<CallCoverageSectionType>) => void;
}

export function CallCoverageSectionComponent({ data, onChange }: CallCoverageSectionProps) {
  const callCoverageFileRef = useRef<HTMLInputElement | null>(null);
  const partnerFileRef = useRef<HTMLInputElement | null>(null);

  const addColleague = () => {
    onChange({ callCoverageColleagues: [...data.callCoverageColleagues, { name: '', specialty: '' }] });
  };

  const updateColleague = (index: number, field: keyof CallCoverageColleague, value: string) => {
    const updated = [...data.callCoverageColleagues];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ callCoverageColleagues: updated });
  };

  const removeColleague = (index: number) => {
    onChange({ callCoverageColleagues: data.callCoverageColleagues.filter((_, i) => i !== index) });
  };

  const addPartner = () => {
    onChange({ partners: [...data.partners, ''] });
  };

  const updatePartner = (index: number, value: string) => {
    const updated = [...data.partners];
    updated[index] = value;
    onChange({ partners: updated });
  };

  const removePartner = (index: number) => {
    onChange({ partners: data.partners.filter((_, i) => i !== index) });
  };

  const handleCallCoverageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onChange({ callCoverageAttachment: files[0].name });
    toast.success(`"${files[0].name}" uploaded as call coverage list`);
  };

  const handlePartnerUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onChange({ partnerListAttachment: files[0].name });
    toast.success(`"${files[0].name}" uploaded as partner list`);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Phone className="h-4 w-4" />
        <AlertDescription>
          Provide information about your call coverage arrangements, including colleagues who provide coverage 
          and any practice partners.
        </AlertDescription>
      </Alert>

      {/* Call Coverage Colleagues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-primary" />
            Call Coverage Colleagues
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.useAttachedList}
              onChange={(e) => onChange({ useAttachedList: e.target.checked })}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <span className="text-sm">See attached list for call coverage colleagues</span>
          </label>

          {data.useAttachedList ? (
            <div className="space-y-2">
              <input
                ref={callCoverageFileRef}
                type="file"
                accept=".pdf,.doc,.docx,.xlsx,.csv"
                className="hidden"
                onChange={(e) => handleCallCoverageUpload(e.target.files)}
              />
              {data.callCoverageAttachment ? (
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border">
                  <Upload className="h-4 w-4 text-primary" />
                  <span className="text-sm flex-1">{data.callCoverageAttachment}</span>
                  <Button variant="ghost" size="sm" onClick={() => onChange({ callCoverageAttachment: undefined })} className="text-destructive h-6 w-6 p-0">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => callCoverageFileRef.current?.click()} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload call coverage list
                </Button>
              )}
            </div>
          ) : (
            <>
              {data.callCoverageColleagues.map((colleague, index) => (
                <Card key={index} className="border-dashed">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid gap-4 md:grid-cols-2">
                        <FormField
                          label="Name"
                          id={`colleague_name_${index}`}
                          value={colleague.name}
                          onChange={(v) => updateColleague(index, 'name', v)}
                          placeholder="Colleague name"
                          required
                        />
                        <FormField
                          label="Specialty"
                          id={`colleague_spec_${index}`}
                          value={colleague.specialty}
                          onChange={(v) => updateColleague(index, 'specialty', v)}
                          placeholder="Specialty"
                          required
                        />
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeColleague(index)} className="text-destructive mt-6">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addColleague} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Call Coverage Colleague
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Practice Partners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-primary" />
            Practice Partners
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.usePartnerList}
              onChange={(e) => onChange({ usePartnerList: e.target.checked })}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <span className="text-sm">See attached list for practice partners</span>
          </label>

          {data.usePartnerList ? (
            <div className="space-y-2">
              <input
                ref={partnerFileRef}
                type="file"
                accept=".pdf,.doc,.docx,.xlsx,.csv"
                className="hidden"
                onChange={(e) => handlePartnerUpload(e.target.files)}
              />
              {data.partnerListAttachment ? (
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border">
                  <Upload className="h-4 w-4 text-primary" />
                  <span className="text-sm flex-1">{data.partnerListAttachment}</span>
                  <Button variant="ghost" size="sm" onClick={() => onChange({ partnerListAttachment: undefined })} className="text-destructive h-6 w-6 p-0">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => partnerFileRef.current?.click()} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload partner list
                </Button>
              )}
            </div>
          ) : (
            <>
              {data.partners.map((partner, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <FormField
                      label={`Partner ${index + 1}`}
                      id={`partner_${index}`}
                      value={partner}
                      onChange={(v) => updatePartner(index, v)}
                      placeholder="Partner name"
                    />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removePartner(index)} className="text-destructive mt-6">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addPartner} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Practice Partner
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
