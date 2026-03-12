import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'success';
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-6 text-center',
      className
    )}>
      <div className={cn(
        'h-16 w-16 rounded-2xl flex items-center justify-center mb-4',
        variant === 'success' ? 'bg-success/10' : 'bg-muted',
      )}>
        <Icon className={cn(
          'h-8 w-8',
          variant === 'success' ? 'text-success' : 'text-muted-foreground',
        )} />
      </div>
      <h3 className={cn(
        'text-lg font-semibold mb-2',
        variant === 'success' && 'text-success',
      )}>{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button className="btn-primary-gradient" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
