'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Listing, Seller, PriceComparison, ComparisonItem } from '@/types';
import { useSavedItemsStore, useUserPreferencesStore } from '@/store';
import { PlatformBadge, ConditionBadge, ShippingBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatPrice, formatRelativeTime, getEstimatedDeliveryRange, formatRating, getRatingStars, cn } from '@/lib/utils';
import { PLATFORM_CONFIG } from '@/lib/constants';

interface ListingDetailProps {
  listing: Listing;
  seller?: Seller | null;
  comparison?: PriceComparison | null;
  className?: string;
}

export default function ListingDetail({
  listing,
  seller,
  comparison,
  className,
}: ListingDetailProps) {
  const router = useRouter();
  const { currency } = useUserPreferencesStore();
  const { isSaved, toggleSave, hasPriceAlert, addPriceAlert, removePriceAlert } = useSavedItemsStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const price = (currency === 'USD' || currency === 'GBP'
    ? listing.price.converted[currency]
    : listing.price.amount) || listing.price.amount;
  const shippingCost = listing.shipping.freeShipping
    ? 0
    : listing.shipping.cost;
  const totalPrice = price + shippingCost;

  const deliveryEstimate = getEstimatedDeliveryRange(
    listing.shipping.estimatedDays.domestic,
    seller?.shipping?.avgShipTimeDays || 2
  );

  const handleBuyNow = () => {
    setIsRedirecting(true);
    // Simulate redirect delay for interstitial
    setTimeout(() => {
      window.open(listing.sourceUrl, '_blank');
      setIsRedirecting(false);
    }, 1500);
  };

  const handleSaveToggle = () => {
    toggleSave(listing.id);
  };

  const handlePriceAlert = () => {
    if (hasPriceAlert(listing.id)) {
      removePriceAlert(listing.id);
    } else {
      addPriceAlert(listing.id, price * 0.9, currency); // Alert at 10% discount
    }
  };

  return (
    <div className={cn('min-h-screen bg-white', className)}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToggle}
              className={cn(
                'p-2 rounded-full transition-colors',
                isSaved(listing.id) ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
              )}
            >
              <svg
                className="w-6 h-6"
                fill={isSaved(listing.id) ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 p-4">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={listing.images[currentImageIndex]?.url || '/images/placeholder.png'}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>

            {listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      'flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors',
                      currentImageIndex === index ? 'border-black' : 'border-transparent'
                    )}
                  >
                    <img
                      src={image.url}
                      alt={`${listing.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Brand & Title */}
            <div>
              {listing.brand && (
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  {listing.brand}
                </p>
              )}
              <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
            </div>

            {/* Price */}
            <div className="flex items-end gap-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(price, currency)}
              </span>
              {!listing.shipping.freeShipping && (
                <span className="text-lg text-gray-500">
                  + {formatPrice(shippingCost, currency)} shipping
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <PlatformBadge platform={listing.sourcePlatform} />
              <ConditionBadge condition={listing.condition} />
              {listing.shipping.freeShipping && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Free Shipping
                </span>
              )}
            </div>

            {/* Delivery Estimate */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Estimated delivery: {deliveryEstimate.display}
                  </p>
                  <p className="text-sm text-gray-500">
                    Ships from {seller?.location?.city || 'seller location'}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleBuyNow}
                isLoading={isRedirecting}
                size="lg"
                className="w-full"
              >
                {isRedirecting ? 'Opening...' : `Buy on ${PLATFORM_CONFIG[listing.sourcePlatform]?.displayName}`}
              </Button>

              {comparison && comparison.listings.length > 1 && (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => setShowComparison(!showComparison)}
                >
                  Compare {comparison.listings.length} Sellers
                </Button>
              )}

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handlePriceAlert}
                  className="flex-1"
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  }
                >
                  {hasPriceAlert(listing.id) ? 'Alert Set' : 'Price Alert'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleSaveToggle}
                  className="flex-1"
                  leftIcon={
                    <svg
                      className="w-4 h-4"
                      fill={isSaved(listing.id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  }
                >
                  {isSaved(listing.id) ? 'Saved' : 'Save'}
                </Button>
              </div>
            </div>

            {/* Item Details */}
            <div className="border-t pt-6 space-y-4">
              <h2 className="font-bold text-gray-900">Item Details</h2>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Size</dt>
                  <dd className="font-medium text-gray-900">{listing.size.original}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Condition</dt>
                  <dd className="font-medium text-gray-900">
                    {listing.condition.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Color</dt>
                  <dd className="font-medium text-gray-900">{listing.color.join(', ')}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Category</dt>
                  <dd className="font-medium text-gray-900">
                    {listing.category.secondary.replace(/(^\w)/g, m => m.toUpperCase())}
                  </dd>
                </div>
              </dl>

              <div>
                <dt className="text-gray-500 text-sm mb-2">Description</dt>
                <dd className="text-sm text-gray-700">{listing.description}</dd>
              </div>

              <p className="text-xs text-gray-400">
                Listed {formatRelativeTime(listing.listedAt)}
              </p>
            </div>

            {/* Seller Info */}
            {seller && <SellerCard seller={seller} />}
          </div>
        </div>

        {/* Price Comparison Section */}
        {showComparison && comparison && (
          <PriceComparisonView comparison={comparison} currency={currency} />
        )}
      </div>

      {/* Redirect Interstitial */}
      {isRedirecting && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Taking you to {PLATFORM_CONFIG[listing.sourcePlatform]?.displayName}...
            </h2>
            <p className="text-sm text-gray-500">
              Tip: Message the seller to confirm availability!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Seller Card Component
interface SellerCardProps {
  seller: Seller;
}

function SellerCard({ seller }: SellerCardProps) {
  const router = useRouter();

  return (
    <div className="border rounded-xl p-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
          {seller.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900">{seller.displayName}</h3>
            {seller.verified && (
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-yellow-500">{getRatingStars(seller.averageRating)}</span>
            <span>{formatRating(seller.averageRating)}</span>
            <span>·</span>
            <span>{seller.totalReviews} reviews</span>
          </div>
        </div>
        <span className={cn(
          'px-2 py-1 text-xs font-medium rounded-full',
          seller.type === 'pro_reseller' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
        )}>
          {seller.type === 'pro_reseller' ? 'Pro Seller' : 'Individual'}
        </span>
      </div>

      {/* Shipping Badges */}
      {seller.shippingBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {seller.shippingBadges.map((badge) => (
            <ShippingBadge key={badge} badge={badge} />
          ))}
        </div>
      )}

      {/* Shipping Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">
            {seller.shipping?.avgShipTimeDays?.toFixed(1) || '–'}d
          </p>
          <p className="text-xs text-gray-500">Avg Ship Time</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">
            {seller.shipping?.onTimeDeliveryRate
              ? `${Math.round(seller.shipping.onTimeDeliveryRate * 100)}%`
              : '–'}
          </p>
          <p className="text-xs text-gray-500">On-Time</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">
            {seller.platforms[0]?.salesCount || '–'}
          </p>
          <p className="text-xs text-gray-500">Sales</p>
        </div>
      </div>
    </div>
  );
}

// Price Comparison View
interface PriceComparisonViewProps {
  comparison: PriceComparison;
  currency: 'USD' | 'GBP' | 'EUR';
}

function PriceComparisonView({ comparison, currency }: PriceComparisonViewProps) {
  const displayCurrency = currency === 'EUR' ? 'USD' : currency;
  return (
    <div className="border-t mt-8 pt-8 px-4 pb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Compare {comparison.listings.length} Sellers
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {comparison.listings.map((item) => (
          <ComparisonCard key={item.listing.id} item={item} currency={displayCurrency} />
        ))}
      </div>
    </div>
  );
}

// Comparison Card
interface ComparisonCardProps {
  item: ComparisonItem;
  currency: 'USD' | 'GBP';
}

function ComparisonCard({ item, currency }: ComparisonCardProps) {
  const { listing, seller, totalPrice, badges, estimatedDelivery } = item;

  const handleBuy = () => {
    window.open(listing.sourceUrl, '_blank');
  };

  return (
    <div className={cn(
      'border rounded-xl p-4 relative',
      badges.includes('best_value') && 'border-green-500 ring-1 ring-green-500'
    )}>
      {/* Badge */}
      {badges.length > 0 && (
        <div className="absolute -top-3 left-4 flex gap-1">
          {badges.includes('best_value') && (
            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full">
              Best Value
            </span>
          )}
          {badges.includes('lowest_price') && (
            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-full">
              Lowest Price
            </span>
          )}
          {badges.includes('fastest_delivery') && (
            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded-full">
              Fastest
            </span>
          )}
        </div>
      )}

      <div className="flex items-start gap-3 mb-4">
        <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={listing.images[0]?.url || '/images/placeholder.png'}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <PlatformBadge platform={listing.sourcePlatform} />
          </div>
          {seller && (
            <p className="text-sm text-gray-600 truncate">{seller.displayName}</p>
          )}
          {seller && (
            <p className="text-sm text-gray-500">
              <span className="text-yellow-500">★</span> {formatRating(seller.averageRating)}
            </p>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="mb-3">
        <p className="text-xl font-bold text-gray-900">
          {formatPrice(totalPrice, currency)} <span className="text-sm font-normal text-gray-500">total</span>
        </p>
        <p className="text-sm text-gray-500">
          {formatPrice((currency === 'USD' || currency === 'GBP' ? listing.price.converted[currency] : listing.price.amount) || listing.price.amount, currency)}
          {!listing.shipping.freeShipping && ` + ${formatPrice(listing.shipping.cost, currency)} shipping`}
        </p>
      </div>

      {/* Delivery */}
      <p className="text-sm text-gray-600 mb-4">
        📦 Est. delivery: {new Date(estimatedDelivery.min).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -
        {new Date(estimatedDelivery.max).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </p>

      <Button onClick={handleBuy} size="sm" className="w-full">
        Buy on {PLATFORM_CONFIG[listing.sourcePlatform]?.displayName}
      </Button>
    </div>
  );
}
