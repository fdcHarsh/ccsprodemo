import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormRadioGroup } from './FormFields';
import { DisclosuresSection as DisclosuresSectionType, DisclosureQuestion, DisclosureAttachment, MalpracticeClaim } from '@/types/lhl234Profile';
import { AlertTriangle, CheckCircle, HelpCircle, Upload, X, FileText, Paperclip } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useRef } from 'react';
import { toast } from 'sonner';
import { MalpracticeClaimsSection } from './MalpracticeClaimsSection';

interface DisclosuresSectionProps {
  data: DisclosuresSectionType;
  onChange: (data: Partial<DisclosuresSectionType>) => void;
}

const QUESTION_CATEGORIES = {
  licensure: 'Licensure',
  hospital: 'Hospital Privileges',
  education: 'Education & Training',
  dea: 'DEA/DPS',
  government: 'Medicare/Medicaid',
  investigations: 'Investigations',
  malpractice: 'Malpractice',
  criminal: 'Criminal',
  ability: 'Ability to Perform',
};

const QUESTION_20_TOOLTIP = `"Currently" means sufficiently recent to justify a reasonable belief that the use of drug may have an ongoing impact on one's ability to practice medicine. "Illegal use of drugs" refers to drugs whose possession or distribution is unlawful under the Controlled Substances Act. It does not include the use of a drug taken under supervision by a licensed health care professional.`;

export function DisclosuresSectionComponent({ data, onChange }: DisclosuresSectionProps) {
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const updateQuestion = (index: number, field: 'answer' | 'explanation', value: string) => {
    const updated = [...data.questions];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ questions: updated });
  };

  const addAttachment = (questionIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const updated = [...data.questions];
    const currentAttachments = updated[questionIndex].attachments || [];
    
    const newAttachments: DisclosureAttachment[] = Array.from(files).map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filename: file.name,
      uploadedAt: new Date().toISOString(),
    }));

    updated[questionIndex] = {
      ...updated[questionIndex],
      attachments: [...currentAttachments, ...newAttachments],
    };
    
    onChange({ questions: updated });
    toast.success(`${files.length} attachment(s) added for Question #${updated[questionIndex].questionNumber}`);
  };

  const removeAttachment = (questionIndex: number, attachmentId: string) => {
    const updated = [...data.questions];
    const currentAttachments = updated[questionIndex].attachments || [];
    updated[questionIndex] = {
      ...updated[questionIndex],
      attachments: currentAttachments.filter(a => a.id !== attachmentId),
    };
    onChange({ questions: updated });
  };

  const answeredCount = data.questions.filter(q => q.answer !== '').length;
  const yesAnswers = data.questions.filter(q => q.answer === 'Yes');
  const allNo = data.questions.every(q => q.answer === 'No');

  const groupedQuestions = data.questions.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, DisclosureQuestion[]>);

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert className="border-destructive/50 bg-destructive/10">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-sm">
          <strong>Important:</strong> Please provide an explanation for any question answered 'Yes'.
          You can also attach supporting documents for each "Yes" answer (Attachment G).
          These questions are required by Texas law and insurance regulations. Answer truthfully - false statements may result
          in denial of credentialing.
        </AlertDescription>
      </Alert>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">{answeredCount} of 23 questions answered</span>
              {allNo && answeredCount === 23 && (
                <span className="flex items-center gap-1 text-sm text-success">
                  <CheckCircle className="h-4 w-4" />
                  All questions answered "No"
                </span>
              )}
            </div>
            {yesAnswers.length > 0 && (
              <span className="flex items-center gap-1 text-sm text-warning">
                <AlertTriangle className="h-4 w-4" />
                {yesAnswers.length} "Yes" answer{yesAnswers.length > 1 ? 's' : ''}: Q{yesAnswers.map(q => q.questionNumber).join(', Q')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions by Category */}
      {Object.entries(groupedQuestions).map(([category, questions]) => (
        <Card key={category}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{QUESTION_CATEGORIES[category as keyof typeof QUESTION_CATEGORIES]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((q) => {
              const qIndex = data.questions.findIndex(dq => dq.questionNumber === q.questionNumber);
              const showExplanation = q.answer === 'Yes';
              const attachments = q.attachments || [];
              
              return (
                <div
                  key={q.questionNumber}
                  className={cn(
                    'p-4 rounded-lg border',
                    q.answer === 'Yes' ? 'border-warning bg-warning/5' : 'border-muted',
                    q.answer === 'No' && 'border-success/30 bg-success/5'
                  )}
                >
                  <div className="flex gap-3">
                    <span className="font-semibold text-primary min-w-[2rem]">#{q.questionNumber}</span>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-2">
                        <p className="text-sm leading-relaxed">{q.questionText}</p>
                        {q.questionNumber === 20 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-md">
                                <p className="text-sm">{QUESTION_20_TOOLTIP}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      
                      <FormRadioGroup
                        label=""
                        id={`disclosure_${q.questionNumber}`}
                        value={q.answer}
                        onChange={(v) => updateQuestion(qIndex, 'answer', v)}
                        options={[
                          { value: 'Yes', label: 'Yes' },
                          { value: 'No', label: 'No' },
                        ]}
                        required
                      />

                      {showExplanation && (
                        <div className="space-y-4 mt-4 p-3 bg-warning/10 rounded-lg">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Question {q.questionNumber} - Please Explain <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                              value={q.explanation || ''}
                              onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                              placeholder="Provide complete details including dates, locations, parties involved, and current status/resolution"
                              rows={4}
                              maxLength={2000}
                              className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground text-right">
                              {(q.explanation || '').length}/2000 characters
                            </p>
                          </div>

                          {/* Attachment Upload Section */}
                          <div className="space-y-2 pt-2 border-t border-warning/20">
                            <Label className="text-sm font-medium flex items-center gap-2">
                              <Paperclip className="h-4 w-4" />
                              Supporting Documents (Attachment G)
                            </Label>
                            
                            {/* Existing attachments */}
                            {attachments.length > 0 && (
                              <div className="space-y-2">
                                {attachments.map((attachment) => (
                                  <div
                                    key={attachment.id}
                                    className="flex items-center gap-2 p-2 bg-background rounded border"
                                  >
                                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                                    <span className="text-sm flex-1 truncate">{attachment.filename}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeAttachment(qIndex, attachment.id)}
                                      className="h-6 w-6 p-0 text-destructive"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Upload button */}
                            <input
                              ref={(el) => { fileInputRefs.current[q.questionNumber] = el; }}
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => addAttachment(qIndex, e.target.files)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRefs.current[q.questionNumber]?.click()}
                              className="w-full"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Supporting Document
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              Accepted formats: PDF, DOC, DOCX, JPG, PNG
                            </p>
                          </div>
                        </div>
                      )}

                      {q.questionNumber === 16 && q.answer === 'Yes' && (
                        <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                          <p className="text-sm">
                            <strong>Note:</strong> Since you answered "Yes," complete Attachment G below
                            with details for each malpractice claim.
                          </p>
                        </div>
                      )}
                    </div>
                    {q.answer === 'No' && <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />}
                    {q.answer === 'Yes' && <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Attachment G: Malpractice Claims — shown when Q16 = Yes */}
      {data.questions.find(q => q.questionNumber === 16)?.answer === 'Yes' && (
        <Card className="border-warning/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Attachment G — Malpractice Claims History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MalpracticeClaimsSection
              claims={data.malpracticeClaims || []}
              onChange={(claims) => onChange({ malpracticeClaims: claims })}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
