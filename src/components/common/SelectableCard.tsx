import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectableCardProps {
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  autoScrollOnSelect?: boolean;
}

export function SelectableCard({
  isSelected,
  onClick,
  children,
  className,
  autoScrollOnSelect = false,
}: SelectableCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isSelected && autoScrollOnSelect && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [isSelected, autoScrollOnSelect]);

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={onClick}
      className={cn(
        'relative p-4 rounded-lg border-2 text-left transition-all',
        isSelected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-border hover:border-primary/50 hover:bg-muted/30',
        className
      )}
    >
      {/* Checkmark indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
        </div>
      )}
      {children}
    </button>
  );
}
