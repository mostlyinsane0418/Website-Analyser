// Fashion Resale Discovery Platform - Utility Functions

import { Currency, Region, Price, Shipping, ItemCondition, Platform } from '@/types';
import { CURRENCY_CONFIG, REGION_CURRENCY, CONDITION_DISPLAY, PLATFORM_CONFIG } from './constants';
import { formatDistanceToNow, format, addDays } from 'date-fns';

// ============================================
// Currency & Price Formatting
// ============================================

export function formatPrice(amount: number, currency: Currency): string {
  const config = CURRENCY_CONFIG[currency];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPriceRange(min: number, max: number, currency: Currency): string {
  if (min === max) {
    return formatPrice(min, currency);
  }
  return `${formatPrice(min, currency)} - ${formatPrice(max, currency)}`;
}

export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  // Exchange rates (would be fetched from API in production)
  const rates: Record<string, number> = {
    'USD_GBP': 0.79,
    'USD_EUR': 0.92,
    'GBP_USD': 1.27,
    'GBP_EUR': 1.17,
    'EUR_USD': 1.09,
    'EUR_GBP': 0.86,
  };

  if (fromCurrency === toCurrency) return amount;

  const rateKey = `${fromCurrency}_${toCurrency}`;
  const rate = rates[rateKey] || 1;
  return Math.round(amount * rate * 100) / 100;
}

export function getTotalPrice(price: Price, shipping: Shipping, userCurrency: Currency): number {
  const priceInUserCurrency = (userCurrency === 'USD' || userCurrency === 'GBP'
    ? price.converted[userCurrency]
    : null) || convertCurrency(price.amount, price.currency, userCurrency);

  const shippingInUserCurrency = shipping.freeShipping
    ? 0
    : convertCurrency(shipping.cost, shipping.currency, userCurrency);

  return priceInUserCurrency + shippingInUserCurrency;
}

export function getCurrencyForRegion(region: Region): Currency {
  return REGION_CURRENCY[region];
}

// ============================================
// Date & Time Formatting
// ============================================

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string | Date, pattern: string = 'MMM d, yyyy'): string {
  return format(new Date(date), pattern);
}

export function getEstimatedDeliveryRange(
  shipDays: { min: number; max: number },
  sellerShipTime: number = 2
): { min: Date; max: Date; display: string } {
  const now = new Date();
  const minDate = addDays(now, sellerShipTime + shipDays.min);
  const maxDate = addDays(now, sellerShipTime + shipDays.max);

  const display = `${format(minDate, 'MMM d')} - ${format(maxDate, 'MMM d')}`;

  return { min: minDate, max: maxDate, display };
}

// ============================================
// Condition Formatting
// ============================================

export function getConditionLabel(condition: ItemCondition): string {
  return CONDITION_DISPLAY[condition].label;
}

export function getConditionShortLabel(condition: ItemCondition): string {
  return CONDITION_DISPLAY[condition].shortLabel;
}

// ============================================
// Platform Formatting
// ============================================

export function getPlatformDisplayName(platform: Platform): string {
  return PLATFORM_CONFIG[platform]?.displayName || platform;
}

export function getPlatformColor(platform: Platform): string {
  return PLATFORM_CONFIG[platform]?.color || '#666666';
}

// ============================================
// Rating & Trust Formatting
// ============================================

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function getRatingStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

export function formatTrustScore(score: number): string {
  return `${score}/100`;
}

export function getTrustLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

// ============================================
// Number Formatting
// ============================================

export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function formatCount(count: number, singular: string, plural?: string): string {
  const pluralForm = plural || `${singular}s`;
  return `${formatCompactNumber(count)} ${count === 1 ? singular : pluralForm}`;
}

// ============================================
// String Utilities
// ============================================

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function titleCase(str: string): string {
  return str.split(' ').map(capitalize).join(' ');
}

// ============================================
// URL Utilities
// ============================================

export function buildSearchUrl(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  return `/search?${searchParams.toString()}`;
}

export function getAffiliateUrl(platform: Platform, originalUrl: string): string {
  // Would add affiliate tracking parameters in production
  const affiliateParams: Record<Platform, string> = {
    depop: '?ref=thrift-finder',
    poshmark: '?ref=thrift-finder',
    ebay_us: '&mkcid=1&mkrid=thrift-finder',
    ebay_uk: '&mkcid=1&mkrid=thrift-finder',
    vinted: '',
    thredUp: '?ref=thrift-finder',
    vestiaire: '?utm_source=thrift-finder',
  };

  const separator = originalUrl.includes('?') ? '&' : '';
  return `${originalUrl}${separator}${affiliateParams[platform] || ''}`;
}

// ============================================
// Validation Utilities
// ============================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(parsed.pathname) ||
           parsed.hostname.includes('cloudinary') ||
           parsed.hostname.includes('imgix');
  } catch {
    return false;
  }
}

// ============================================
// Array Utilities
// ============================================

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const value = String(item[key]);
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal);
    const bStr = String(bVal);
    return order === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });
}

export function unique<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

// ============================================
// CSS Class Utilities
// ============================================

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
