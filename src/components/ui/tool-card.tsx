import * as React from 'react';
import { Laptop, Smartphone, Star } from 'lucide-react';
import { cn } from '@/libs/utils';

export interface ToolCardProps {
  icon?: React.ReactNode;
  name: string;
  category: string;
  isActive?: boolean;
  supportsDesktop?: boolean;
  supportsMobile?: boolean;
  onClick?: () => void;
  className?: string;
  /** When set (e.g. after localStorage hydrate), shows a pin control on the card */
  pinButton?: {
    pinned: boolean;
    onToggle: () => void;
  };
}

export function ToolCard({
  icon,
  name,
  category,
  isActive = false,
  supportsDesktop = true,
  supportsMobile = true,
  onClick,
  className,
  pinButton,
}: ToolCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const isSelected = isActive || isHovered;

  return (
    <div
      className={cn(
        'group relative bg-white dark:bg-neutral-800 border rounded-xl h-[165px] cursor-pointer transition-all duration-200',
        pinButton?.pinned && 'ring-1 ring-orange-400 dark:ring-orange-600',
        isSelected
          ? 'border-orange-600 hover:shadow-md'
          : 'border-neutral-200 dark:border-neutral-700 hover:shadow-md',
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {pinButton ? (
        <button
          type="button"
          className={cn(
            'absolute left-1.5 top-1.5 z-20 flex h-8 w-8 items-center justify-center rounded-md border bg-white/95 shadow-sm backdrop-blur-sm transition-colors dark:bg-neutral-900/95',
            pinButton.pinned
              ? 'border-orange-300 dark:border-orange-800'
              : 'border-neutral-200 hover:bg-orange-50 dark:border-neutral-600 dark:hover:bg-orange-950/50'
          )}
          aria-label={pinButton.pinned ? `Unpin ${name}` : `Pin ${name}`}
          aria-pressed={pinButton.pinned}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            pinButton.onToggle();
          }}
        >
          <Star
            className={cn(
              'h-4 w-4 text-neutral-500 dark:text-neutral-400',
              pinButton.pinned &&
                'fill-orange-500 text-orange-600 dark:fill-orange-500 dark:text-orange-400'
            )}
            strokeWidth={1.5}
          />
        </button>
      ) : null}
      <div className="flex flex-col gap-2 h-[165px] overflow-hidden rounded-[inherit]">
        {/* Icon Section */}
        <div
          className={cn(
            'relative flex flex-col gap-2.5 items-center justify-center flex-1 px-14 py-5 transition-colors duration-200 dark:bg-neutral-900',
            isSelected ? 'bg-orange-50' : 'bg-neutral-100'
          )}
        >
          {/* Device Compatibility Badge */}
          {(supportsDesktop || supportsMobile) && (
            <div className="absolute top-1.5 right-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md px-1 py-0.5 flex items-center gap-0.5">
              {supportsDesktop && (
                <Laptop className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              )}
              {supportsMobile && (
                <Smartphone className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              )}
            </div>
          )}

          {/* Tool Icon */}
          <div
            className={cn(
              'w-10 h-10 flex items-center justify-center transition-colors duration-200',
              isSelected ? 'text-orange-600 dark:text-orange-500' : 'text-neutral-400 dark:text-neutral-400'
            )}
          >
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<any>, {
                  strokeWidth: 1.5,
                })
              : icon}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-1 px-3 pb-3">
          {/* Tool Name */}
          <div className="flex flex-col">
            <h3 className="font-medium text-base leading-6 text-neutral-900 dark:text-neutral-100 line-clamp-1">
              {name}
            </h3>
          </div>

          {/* Category Tag */}
          <div className="flex gap-1 items-start">
            <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md px-2 py-0.5">
              <p className="font-normal text-xs leading-[18px] tracking-[0.18px] text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                {category}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

