import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

interface SheetContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side: 'top' | 'bottom' | 'left' | 'right';
}

const SheetContext = React.createContext<SheetContextType | null>(null);

export const Sheet: React.FC<SheetProps> = ({
  open,
  onOpenChange,
  side = 'right',
  children,
}) => {
  return (
    <SheetContext.Provider value={{ open, onOpenChange, side }}>
      {children}
    </SheetContext.Provider>
  );
};

export const SheetContent: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { className?: string }
> = ({ className, children, ...props }) => {
  const context = React.useContext(SheetContext);
  if (!context) throw new Error('SheetContent must be used within Sheet');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        context.onOpenChange(false);
      }
    };
    if (context.open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [context.open]);

  if (!context.open) return null;

  const sideVariants = {
    top: 'inset-x-0 top-0 border-b',
    bottom: 'inset-x-0 bottom-0 border-t rounded-t-3xl max-h-[85vh]',
    left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
    right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
  };

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => context.onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      <div
        className={cn(
          'fixed z-50 bg-card p-6 shadow-2xl transition ease-in-out overflow-y-auto',
          sideVariants[context.side],
          className
        )}
        {...props}
      >
        {children}
        <button
          type="button"
          onClick={() => context.onOpenChange(false)}
          aria-label="Close sheet"
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[36px] min-w-[36px] flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export const SheetHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}
    {...props}
  />
);

export const SheetTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h2
    className={cn('text-lg font-bold text-foreground', className)}
    {...props}
  />
);

export const SheetDescription: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ className, ...props }) => (
  <p
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
);
