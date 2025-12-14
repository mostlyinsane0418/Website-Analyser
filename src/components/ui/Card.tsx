'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({
  children,
  className,
  onClick,
  hover = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl overflow-hidden',
        hover && 'transition-transform duration-200 hover:scale-[1.02] cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Card Header
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('px-4 py-3 border-b border-gray-100', className)}>
      {children}
    </div>
  );
}

// Card Body
interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn('p-4', className)}>{children}</div>;
}

// Card Footer
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('px-4 py-3 border-t border-gray-100', className)}>
      {children}
    </div>
  );
}

// Listing Card
interface ListingCardProps {
  id: string;
  title: string;
  brand?: string;
  price: number;
  currency: string;
  originalPrice?: number;
  imageUrl: string;
  platform: string;
  condition: string;
  likesCount?: number;
  isSaved?: boolean;
  onSave?: (id: string) => void;
  onClick?: (id: string) => void;
  className?: string;
}

export function ListingCard({
  id,
  title,
  brand,
  price,
  currency,
  originalPrice,
  imageUrl,
  platform,
  condition,
  likesCount,
  isSaved = false,
  onSave,
  onClick,
  className,
}: ListingCardProps) {
  const currencySymbol = currency === 'GBP' ? '£' : '$';

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(id);
  };

  return (
    <Card
      className={cn('group shadow-sm hover:shadow-md', className)}
      onClick={() => onClick?.(id)}
      hover
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Save Button */}
        <button
          onClick={handleSaveClick}
          className={cn(
            'absolute top-3 right-3 p-2 rounded-full transition-all duration-200',
            isSaved
              ? 'bg-red-500 text-white'
              : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white'
          )}
        >
          <svg
            className="w-5 h-5"
            fill={isSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Platform Badge */}
        <div className="absolute bottom-3 left-3">
          <span
            className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              platform === 'depop' && 'bg-red-500 text-white',
              platform === 'poshmark' && 'bg-rose-800 text-white',
              platform.includes('ebay') && 'bg-blue-600 text-white',
              platform === 'vinted' && 'bg-teal-500 text-white',
              platform === 'thredUp' && 'bg-green-600 text-white',
              platform === 'vestiaire' && 'bg-black text-white',
              !['depop', 'poshmark', 'vinted', 'thredUp', 'vestiaire'].includes(platform) &&
                !platform.includes('ebay') &&
                'bg-gray-600 text-white'
            )}
          >
            {platform.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
          </span>
        </div>

        {/* Likes Count */}
        {likesCount !== undefined && likesCount > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {likesCount}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {brand && (
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {brand}
          </p>
        )}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              {currencySymbol}{price}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-gray-400 line-through">
                {currencySymbol}{originalPrice}
              </span>
            )}
          </div>
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              condition === 'new_with_tags' && 'bg-green-100 text-green-800',
              condition === 'like_new' && 'bg-blue-100 text-blue-800',
              condition === 'good' && 'bg-yellow-100 text-yellow-800',
              condition === 'fair' && 'bg-orange-100 text-orange-800'
            )}
          >
            {condition === 'new_with_tags'
              ? 'NWT'
              : condition.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
          </span>
        </div>
      </div>
    </Card>
  );
}
