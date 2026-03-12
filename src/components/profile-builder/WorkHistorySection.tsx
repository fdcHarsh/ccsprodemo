import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormSelect } from './FormFields';
import { WorkHistorySection as WorkHistorySectionType, WorkHistoryEntry, EmploymentGap, US_STATES } from '@/types/lhl234Profile';
import { Plus, Trash2, Building2, AlertTriangle, ChevronDown, ChevronUp, ArrowDownToLine } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

const MAX_PREVIOUS_EMPLOYERS = 50;

interface WorkHistorySectionProps {
  data: WorkHistorySectionType;
  onChange: (data: Partial<WorkHistorySectionType>) => void;
}

export function WorkHistorySectionComponent({ data, onChange }: WorkHistorySectionProps) {
  const [openSections, setOpenSections] = useState({ current: true, previous: true, gaps: true });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate detected gaps
  const detectedGaps = useMemo(() => {
    const gaps: { start: string; end: string; months: number }[] = [];
    const allJobs = [data.currentPractice, ...data.previousPractices]
      .filter(j => j.startDate)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    for (let i = 0; i < allJobs.length - 1; i++) {
      const currentEnd = allJobs[i].endDate || new Date().toISOString().split('T')[0];
      const nextStart = allJobs[i + 1].startDate;
      
      if (currentEnd && nextStart) {
        const endDate = new Date(allJobs[i].startDate);
        const startDate = new Date(nextStart);
        if (allJobs[i + 1].endDate) {
          endDate.setTime(new Date(allJobs[i + 1].endDate!).getTime());
        }
        
        const months = Math.floor((new Date(allJobs[i].startDate).getTime() - new Date(allJobs[i + 1].endDate || allJobs[i + 1].startDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
        
        if (months > 6) {
          gaps.push({
            start: allJobs[i + 1].endDate || allJobs[i + 1].startDate,
            end: allJobs[i].startDate,
            months,
          });
        }
      }
    }
    return gaps;
  }, [data]);

  const updateCurrentPractice = (field: keyof WorkHistoryEntry, value: any) => {
    onChange({ currentPractice: { ...data.currentPractice, [field]: value } });
  };

  const moveToPreviousAndAddNew = () => {
    // Move current to previous (set end date to today)
    const movedEntry: WorkHistoryEntry = {
      ...data.currentPractice,
      isCurrent: false,
      endDate: new Date().toISOString().split('T')[0].slice(0, 7), // YYYY-MM format
      reasonForDiscontinuance: '',
    };

    // Create new empty current
    const newCurrent: WorkHistoryEntry = {
      employerName: '',
      address: '',
      city: '',
      state: 'TX',
      postalCode: '',
      startDate: '',
      isCurrent: true,
    };

    // Cascade: prepend moved entry, shift all down, cap at MAX_PREVIOUS_EMPLOYERS
    let newPreviousPractices = [movedEntry, ...data.previousPractices];
    
    // If over the limit, remove the oldest (last) entry
    if (newPreviousPractices.length > MAX_PREVIOUS_EMPLOYERS) {
      newPreviousPractices = newPreviousPractices.slice(0, MAX_PREVIOUS_EMPLOYERS);
      toast.success('Current employer moved to previous. Oldest entry removed.');
    } else {
      toast.success('Current employer moved to previous. Add your new employer details.');
    }

    onChange({
      currentPractice: newCurrent,
      previousPractices: newPreviousPractices,
    });
  };

  const addPreviousPractice = () => {
    if (data.previousPractices.length >= MAX_PREVIOUS_EMPLOYERS) {
    toast.error(`Maximum ${MAX_PREVIOUS_EMPLOYERS} previous employers allowed`);
      return;
    }

    const newEntry: WorkHistoryEntry = {
      employerName: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      reasonForDiscontinuance: '',
    };
    onChange({ previousPractices: [...data.previousPractices, newEntry] });
  };

  const updatePreviousPractice = (index: number, field: keyof WorkHistoryEntry, value: any) => {
    const updated = [...data.previousPractices];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ previousPractices: updated });
  };

  const removePreviousPractice = (index: number) => {
    onChange({ previousPractices: data.previousPractices.filter((_, i) => i !== index) });
  };

  const addGap = () => {
    const newGap: EmploymentGap = { startDate: '', endDate: '', explanation: '' };
    onChange({ gaps: [...data.gaps, newGap] });
  };

  const updateGap = (index: number, field: keyof EmploymentGap, value: string) => {
    const updated = [...data.gaps];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ gaps: updated });
  };

  const removeGap = (index: number) => {
    onChange({ gaps: data.gaps.filter((_, i) => i !== index) });
  };

  const canAddMore = data.previousPractices.length < MAX_PREVIOUS_EMPLOYERS;

  return (
    <div className="space-y-6">
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertDescription>
          List your employment for the past 10 years, starting with your current position. 
          You must account for all gaps greater than 6 months. Use Attachment C for additional entries beyond the primary form.
        </AlertDescription>
      </Alert>

      {/* Current Practice */}
      <Collapsible open={openSections.current} onOpenChange={() => toggleSection('current')}>
        <Card className="border-primary/30">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Current Practice/Employer
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">CURRENT</span>
                </CardTitle>
                {openSections.current ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="Practice/Employer Name"
                  id="currentEmployer"
                  value={data.currentPractice.employerName}
                  onChange={(v) => updateCurrentPractice('employerName', v)}
                  placeholder="Current employer name"
                  required
                  className="md:col-span-2"
                />
                <FormField
                  label="Address"
                  id="currentAddress"
                  value={data.currentPractice.address}
                  onChange={(v) => updateCurrentPractice('address', v)}
                  placeholder="Street address"
                  required
                  className="md:col-span-2"
                />
                <FormField
                  label="City"
                  id="currentCity"
                  value={data.currentPractice.city}
                  onChange={(v) => updateCurrentPractice('city', v)}
                  placeholder="City"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormSelect
                    label="State"
                    id="currentState"
                    value={data.currentPractice.state}
                    onChange={(v) => updateCurrentPractice('state', v)}
                    options={US_STATES}
                    required
                  />
                  <FormField
                    label="ZIP"
                    id="currentZip"
                    value={data.currentPractice.postalCode}
                    onChange={(v) => updateCurrentPractice('postalCode', v)}
                    placeholder="ZIP"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  label="Start Date"
                  id="currentStart"
                  value={data.currentPractice.startDate}
                  onChange={(v) => updateCurrentPractice('startDate', v)}
                  type="month"
                  required
                />
                <FormField
                  label="End Date (leave blank if current)"
                  id="currentEnd"
                  value={data.currentPractice.endDate || ''}
                  onChange={(v) => updateCurrentPractice('endDate', v)}
                  type="month"
                />
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 h-10">
                    <input
                      type="checkbox"
                      checked={data.currentPractice.isCurrent}
                      onChange={(e) => updateCurrentPractice('isCurrent', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">This is my current position</span>
                  </label>
                </div>
              </div>

              {/* Move to Previous Button */}
              {data.currentPractice.employerName && (
                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    onClick={moveToPreviousAndAddNew}
                    className="w-full"
                  >
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    Move to Previous & Add New Employer
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {data.previousPractices.length >= MAX_PREVIOUS_EMPLOYERS 
                      ? `At max capacity (${MAX_PREVIOUS_EMPLOYERS}). Oldest entry will be removed when you move current.`
                      : `${data.previousPractices.length}/${MAX_PREVIOUS_EMPLOYERS} previous employers`}
                  </p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Previous Practices */}
      <Collapsible open={openSections.previous} onOpenChange={() => toggleSection('previous')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Previous Practices/Employers
                  {data.previousPractices.length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({data.previousPractices.length}/{MAX_PREVIOUS_EMPLOYERS})
                    </span>
                  )}
                </CardTitle>
                {openSections.previous ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {data.previousPractices.map((practice, index) => (
                <Card key={index} className="border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Previous Employer #{index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePreviousPractice(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        label="Practice/Employer Name"
                        id={`prevEmployer_${index}`}
                        value={practice.employerName}
                        onChange={(v) => updatePreviousPractice(index, 'employerName', v)}
                        placeholder="Employer name"
                        required
                        className="md:col-span-2"
                      />
                      <FormField
                        label="Address"
                        id={`prevAddress_${index}`}
                        value={practice.address}
                        onChange={(v) => updatePreviousPractice(index, 'address', v)}
                        placeholder="Street address"
                        required
                        className="md:col-span-2"
                      />
                      <FormField
                        label="City"
                        id={`prevCity_${index}`}
                        value={practice.city}
                        onChange={(v) => updatePreviousPractice(index, 'city', v)}
                        placeholder="City"
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                          label="State"
                          id={`prevState_${index}`}
                          value={practice.state}
                          onChange={(v) => updatePreviousPractice(index, 'state', v)}
                          options={US_STATES}
                          required
                        />
                        <FormField
                          label="ZIP"
                          id={`prevZip_${index}`}
                          value={practice.postalCode}
                          onChange={(v) => updatePreviousPractice(index, 'postalCode', v)}
                          placeholder="ZIP"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        label="Start Date"
                        id={`prevStart_${index}`}
                        value={practice.startDate}
                        onChange={(v) => updatePreviousPractice(index, 'startDate', v)}
                        type="month"
                        required
                      />
                      <FormField
                        label="End Date"
                        id={`prevEnd_${index}`}
                        value={practice.endDate || ''}
                        onChange={(v) => updatePreviousPractice(index, 'endDate', v)}
                        type="month"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reason for Discontinuance <span className="text-destructive">*</span></Label>
                      <Textarea
                        value={practice.reasonForDiscontinuance || ''}
                        onChange={(e) => updatePreviousPractice(index, 'reasonForDiscontinuance', e.target.value)}
                        placeholder="e.g., Relocation, Career advancement, Retirement, Practice closure"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button 
                variant="outline" 
                onClick={addPreviousPractice} 
                className="w-full"
                disabled={!canAddMore}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Previous Employer
                {!canAddMore && ` (Max ${MAX_PREVIOUS_EMPLOYERS} reached)`}
              </Button>
              {!canAddMore && (
                <p className="text-xs text-muted-foreground text-center">
                  Maximum entries reached
                </p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Employment Gaps */}
      {detectedGaps.length > 0 && (
        <Alert variant="destructive" className="bg-warning/10 border-warning">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning-foreground">
            <strong>Gap Detected:</strong> We found {detectedGaps.length} gap(s) greater than 6 months in your employment history.
            Please provide explanations below.
          </AlertDescription>
        </Alert>
      )}

      <Collapsible open={openSections.gaps} onOpenChange={() => toggleSection('gaps')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Employment Gap Explanations
                  {data.gaps.length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({data.gaps.length})
                    </span>
                  )}
                </CardTitle>
                {openSections.gaps ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Explain any gaps in employment greater than 6 months.
              </p>
              {data.gaps.map((gap, index) => (
                <Card key={index} className="border-dashed border-warning/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Gap #{index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGap(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        label="Gap Start Date"
                        id={`gapStart_${index}`}
                        value={gap.startDate}
                        onChange={(v) => updateGap(index, 'startDate', v)}
                        type="month"
                        required
                      />
                      <FormField
                        label="Gap End Date"
                        id={`gapEnd_${index}`}
                        value={gap.endDate}
                        onChange={(v) => updateGap(index, 'endDate', v)}
                        type="month"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Explanation <span className="text-destructive">*</span></Label>
                      <Textarea
                        value={gap.explanation}
                        onChange={(e) => updateGap(index, 'explanation', e.target.value)}
                        placeholder="e.g., Maternity leave, Medical leave, Travel, Additional training, Family care"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addGap} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Gap Explanation
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
