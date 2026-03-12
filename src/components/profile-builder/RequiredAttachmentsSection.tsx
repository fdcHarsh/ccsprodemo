import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RequiredAttachmentsChecklist, RequiredAttachmentItem } from '@/types/lhl234Profile';
import { FileText, Upload, X, CheckCircle, AlertTriangle, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RequiredAttachmentsSectionProps {
  data: RequiredAttachmentsChecklist;
  onChange: (data: Partial<RequiredAttachmentsChecklist>) => void;
  hasOtherCDS?: boolean;
}

export function RequiredAttachmentsSectionComponent({ data, onChange, hasOtherCDS }: RequiredAttachmentsSectionProps) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Guard against undefined data from old localStorage profiles
  const items = data?.items ?? [];
  const safeData = { ...data, items };

  const updateItem = (index: number, updates: Partial<RequiredAttachmentItem>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...updates };
    onChange({ items: updated });
  };

  const handleFileUpload = (index: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    updateItem(index, {
      checked: true,
      filename: file.name,
      uploadedAt: new Date().toISOString(),
      documentId: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
    toast.success(`"${file.name}" uploaded for ${items[index].label}`);
  };

  const removeFile = (index: number) => {
    updateItem(index, {
      filename: undefined,
      uploadedAt: undefined,
      documentId: undefined,
    });
    toast.info(`File removed from ${items[index].label}`);
  };

  const lhl234Items = items.filter(i => i.group === 'lhl234').filter(i => i.id !== 'other_cds_certificate' || hasOtherCDS);
  const internalItems = items.filter(i => i.group === 'internal');
  // Handle old profiles without group field - treat as internal
  const ungroupedItems = items.filter(i => !i.group);

  const allGrouped = [...lhl234Items, ...internalItems, ...ungroupedItems];
  const uploadedCount = allGrouped.filter(i => i.filename).length;
  const requiredItems = allGrouped.filter(i => i.required);
  const requiredUploaded = requiredItems.filter(i => i.filename).length;

  const renderItem = (item: RequiredAttachmentItem, globalIndex: number) => (
    <div
      key={item.id}
      className={cn(
        'p-3 rounded-lg border transition-colors',
        item.filename ? 'border-success/30 bg-success/5' : item.required ? 'border-warning/30 bg-warning/5' : 'border-muted'
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={item.checked}
          onCheckedChange={(checked) => updateItem(globalIndex, { checked: !!checked })}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <Label className="text-sm font-medium cursor-pointer">
            {item.label}
            {item.required && <span className="text-destructive ml-1">*</span>}
          </Label>

          {/* Uploaded file display */}
          {item.filename && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-background rounded border">
              <FileText className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm flex-1 truncate">{item.filename}</span>
              <span className="text-xs text-muted-foreground">
                {item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : ''}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(globalIndex)}
                className="h-6 w-6 p-0 text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Upload prompt if checked but no file */}
          {item.checked && !item.filename && (
            <div className="mt-2">
              <input
                ref={(el) => { fileInputRefs.current[item.id] = el; }}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFileUpload(globalIndex, e.target.files)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRefs.current[item.id]?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload {item.label}
              </Button>
            </div>
          )}

          {/* Upload prompt for required items not yet checked */}
          {!item.checked && !item.filename && item.required && (
            <p className="text-xs text-warning mt-1">Required — check and upload before generating packet</p>
          )}
        </div>

        {item.filename && <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />}
      </div>
    </div>
  );

  // Build a global index map for items across groups
  const getGlobalIndex = (item: RequiredAttachmentItem) => items.findIndex(i => i.id === item.id);

  return (
    <div className="space-y-6">
      <Alert>
        <Paperclip className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Page 12 — Required Attachments:</strong> Check each document that will accompany your
          credentialing packet. Upload the document directly or ensure it is already in your Document Vault.
          Items marked with <span className="text-destructive">*</span> are required for most payers.
        </AlertDescription>
      </Alert>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">{uploadedCount} of {allGrouped.length} documents uploaded</span>
              {requiredUploaded === requiredItems.length && requiredItems.length > 0 && (
                <span className="flex items-center gap-1 text-sm text-success">
                  <CheckCircle className="h-4 w-4" />
                  All required documents uploaded
                </span>
              )}
            </div>
            {requiredUploaded < requiredItems.length && (
              <span className="flex items-center gap-1 text-sm text-warning">
                <AlertTriangle className="h-4 w-4" />
                {requiredItems.length - requiredUploaded} required document{requiredItems.length - requiredUploaded > 1 ? 's' : ''} missing
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* LHL234 Supplemental Attachments */}
      {lhl234Items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              LHL234 Supplemental Attachments
            </CardTitle>
            <p className="text-xs text-muted-foreground">Official attachments required by the LHL234 form (page 12).</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {lhl234Items.map((item) => renderItem(item, getGlobalIndex(item)))}
          </CardContent>
        </Card>
      )}

      {/* CCS Pro Supporting Documents */}
      {(internalItems.length > 0 || ungroupedItems.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              CCS Pro Supporting Documents
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              The following documents are requested for CCS Pro profile completeness and are not part of the official LHL234 form.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...internalItems, ...ungroupedItems].map((item) => renderItem(item, getGlobalIndex(item)))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
