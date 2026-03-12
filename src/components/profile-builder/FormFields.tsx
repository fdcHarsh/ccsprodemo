import * as React from 'react';
import { Info, Lock, AlertTriangle, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  tooltip?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'tel' | 'password' | 'date' | 'month' | 'number';
  error?: string;
  disabled?: boolean;
  synced?: boolean;
  secure?: boolean;
  warning?: string;
  className?: string;
  maxLength?: number;
}

export function FormField({
  label,
  id,
  value,
  onChange,
  placeholder,
  tooltip,
  required = false,
  type = 'text',
  error,
  disabled,
  synced,
  secure,
  warning,
  className,
  maxLength,
}: FormFieldProps) {
  const hasError = !!error;
  const hasWarning = !!warning;
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className={cn(hasError && 'text-destructive')}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {secure && <Lock className="h-4 w-4 text-primary" />}
        {synced && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <RefreshCw className="h-4 w-4 text-primary" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">This field syncs across sections</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={cn(
            hasError && 'border-destructive focus-visible:ring-destructive',
            hasWarning && 'border-warning',
            value && !hasError && 'border-success/50'
          )}
        />
      </div>
      {hasError && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {error}
        </p>
      )}
      {hasWarning && !hasError && (
        <p className="text-sm text-warning flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {warning}
        </p>
      )}
    </div>
  );
}

interface FormSelectProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  tooltip?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function FormSelect({
  label,
  id,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  tooltip,
  required = false,
  error,
  disabled,
  className,
}: FormSelectProps) {
  const hasError = !!error;
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className={cn(hasError && 'text-destructive')}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          hasError && 'border-destructive',
          value && !hasError && 'border-success/50'
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hasError && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

interface FormRadioGroupProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  inline?: boolean;
}

export function FormRadioGroup({
  label,
  id,
  value,
  onChange,
  options,
  tooltip,
  required = false,
  error,
  disabled,
  className,
  inline = true,
}: FormRadioGroupProps) {
  const hasError = !!error;
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Label className={cn(hasError && 'text-destructive')}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className={cn('flex gap-4', !inline && 'flex-col gap-2')}>
        {options.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              'flex items-center gap-2 cursor-pointer',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <input
              type="radio"
              name={id}
              value={opt.value}
              checked={value === opt.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="h-4 w-4 text-primary border-input focus:ring-primary"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
      {hasError && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

interface FormCheckboxGroupProps {
  label: string;
  id: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function FormCheckboxGroup({
  label,
  id,
  value,
  onChange,
  options,
  tooltip,
  required = false,
  error,
  disabled,
  className,
}: FormCheckboxGroupProps) {
  const hasError = !!error;
  
  const handleChange = (optValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optValue]);
    } else {
      onChange(value.filter((v) => v !== optValue));
    }
  };
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Label className={cn(hasError && 'text-destructive')}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              'flex items-center gap-2 cursor-pointer',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <input
              type="checkbox"
              checked={value.includes(opt.value)}
              onChange={(e) => handleChange(opt.value, e.target.checked)}
              disabled={disabled}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
      {hasError && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
