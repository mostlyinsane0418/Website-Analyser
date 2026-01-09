'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'platform';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    platform: 'bg-black text-white',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}

// Platform-specific badge
interface PlatformBadgeProps {
  platform: string;
  className?: string;
}

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const platformColors: Record<string, string> = {
    depop: 'bg-red-500 text-white',
    poshmark: 'bg-rose-800 text-white',
    ebay_us: 'bg-blue-600 text-white',
    ebay_uk: 'bg-blue-600 text-white',
    vinted: 'bg-teal-500 text-white',
    thredUp: 'bg-green-600 text-white',
    vestiaire: 'bg-black text-white',
  };

  const displayNames: Record<string, string> = {
    depop: 'Depop',
    poshmark: 'Poshmark',
    ebay_us: 'eBay',
    ebay_uk: 'eBay UK',
    vinted: 'Vinted',
    thredUp: 'ThredUp',
    vestiaire: 'Vestiaire',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
        platformColors[platform] || 'bg-gray-600 text-white',
        className
      )}
    >
      {displayNames[platform] || platform}
    </span>
  );
}

// Condition badge
interface ConditionBadgeProps {
  condition: string;
  className?: string;
}

export function ConditionBadge({ condition, className }: ConditionBadgeProps) {
  const conditionStyles: Record<string, string> = {
    new_with_tags: 'bg-green-100 text-green-800',
    like_new: 'bg-blue-100 text-blue-800',
    good: 'bg-yellow-100 text-yellow-800',
    fair: 'bg-orange-100 text-orange-800',
  };

  const displayNames: Record<string, string> = {
    new_with_tags: 'NWT',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
        conditionStyles[condition] || 'bg-gray-100 text-gray-800',
        className
      )}
    >
      {displayNames[condition] || condition}
    </span>
  );
}

// Shipping badge
interface ShippingBadgeProps {
  badge: string;
  className?: string;
}

export function ShippingBadge({ badge, className }: ShippingBadgeProps) {
  const badgeConfig: Record<string, { icon: string; label: string; style: string }> = {
    lightning_shipper: {
      icon: '⚡',
      label: 'Lightning Shipper',
      style: 'bg-yellow-100 text-yellow-800',
    },
    fast_reliable: {
      icon: '🚀',
      label: 'Fast & Reliable',
      style: 'bg-blue-100 text-blue-800',
    },
    tracking_always: {
      icon: '📦',
      label: 'Tracking Always',
      style: 'bg-green-100 text-green-800',
    },
    accurate_estimates: {
      icon: '🎯',
      label: 'Accurate Estimates',
      style: 'bg-purple-100 text-purple-800',
    },
  };

  const config = badgeConfig[badge];
  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
        config.style,
        className
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
