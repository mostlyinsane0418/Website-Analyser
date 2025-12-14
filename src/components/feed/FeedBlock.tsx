'use client';

import { useRouter } from 'next/navigation';
import { FeedBlock as FeedBlockType, Listing } from '@/types';
import { ListingCard } from '@/components/ui/Card';
import { useSavedItemsStore } from '@/store';
import { cn } from '@/lib/utils';

interface FeedBlockProps {
  block: FeedBlockType;
  className?: string;
}

export default function FeedBlock({ block, className }: FeedBlockProps) {
  const router = useRouter();
  const { isSaved, toggleSave } = useSavedItemsStore();

  const handleListingClick = (id: string) => {
    router.push(`/listing/${id}`);
  };

  const handleSeeAll = () => {
    // Build search URL based on block type
    let searchUrl = '/search?';
    switch (block.type) {
      case 'trending':
        searchUrl += 'sort=newest';
        break;
      case 'price_based':
        searchUrl += `maxPrice=${block.metadata?.priceMax || 50}`;
        break;
      case 'theme_collection':
        searchUrl += `theme=${block.metadata?.theme}`;
        break;
      case 'just_dropped':
        searchUrl += 'sort=newest';
        break;
      case 'selling_fast':
        searchUrl += 'sort=popular';
        break;
      default:
        break;
    }
    router.push(searchUrl);
  };

  const getBlockIcon = () => {
    switch (block.type) {
      case 'trending':
        return '🔥';
      case 'price_based':
        return '🎁';
      case 'theme_collection':
        return '🏷️';
      case 'just_dropped':
        return '⚡';
      case 'selling_fast':
        return '🔥';
      case 'because_you_saved':
        return '💫';
      case 'complete_the_look':
        return '👀';
      case 'style_quiz_results':
        return '👗';
      case 'recently_viewed':
        return '🕐';
      case 'local_finds':
        return '📍';
      default:
        return '✨';
    }
  };

  if (block.items.length === 0) {
    return null;
  }

  return (
    <section className={cn('py-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>{getBlockIcon()}</span>
            <span>{block.title}</span>
          </h2>
          {block.subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{block.subtitle}</p>
          )}
        </div>
        <button
          onClick={handleSeeAll}
          className="text-sm font-medium text-gray-700 hover:text-black flex items-center gap-1 transition-colors"
        >
          See all
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 md:px-0 snap-x snap-mandatory scrollbar-hide">
          {block.items.map((listing) => (
            <div
              key={listing.id}
              className="flex-shrink-0 w-44 md:w-52 snap-start"
            >
              <ListingCard
                id={listing.id}
                title={listing.title}
                brand={listing.brand}
                price={listing.price.amount}
                currency={listing.price.currency}
                imageUrl={listing.images[0]?.url || '/images/placeholder.png'}
                platform={listing.sourcePlatform}
                condition={listing.condition}
                likesCount={listing.likesCount}
                isSaved={isSaved(listing.id)}
                onSave={toggleSave}
                onClick={handleListingClick}
              />
            </div>
          ))}
        </div>

        {/* Scroll Indicators (desktop only) */}
        <div className="hidden md:block">
          <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

// Theme Collection Block - Special styling
interface ThemeBlockProps {
  block: FeedBlockType;
  className?: string;
}

export function ThemeBlock({ block, className }: ThemeBlockProps) {
  const router = useRouter();

  const handleExplore = () => {
    router.push(`/search?theme=${block.metadata?.theme}`);
  };

  // Get a hero image from the first listing
  const heroImage = block.items[0]?.images[0]?.url || '/images/placeholder.png';

  return (
    <section className={cn('py-6 px-4 md:px-0', className)}>
      <div
        className="relative rounded-2xl overflow-hidden h-64 md:h-80 cursor-pointer group"
        onClick={handleExplore}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${heroImage})` }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <span className="text-sm font-medium text-white/80 mb-1">
            🏷️ THEME COLLECTION
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {block.title}
          </h2>
          <p className="text-white/80 mb-4">{block.subtitle}</p>
          <button className="self-start px-4 py-2 bg-white text-black font-medium rounded-full hover:bg-gray-100 transition-colors">
            Explore {block.items.length} items →
          </button>
        </div>
      </div>
    </section>
  );
}

// Complete the Look Block - Interactive outfit
interface CompleteTheLookBlockProps {
  block: FeedBlockType;
  className?: string;
}

export function CompleteTheLookBlock({ block, className }: CompleteTheLookBlockProps) {
  const router = useRouter();

  const handleItemClick = (listing: Listing) => {
    router.push(`/listing/${listing.id}`);
  };

  if (block.items.length === 0) return null;

  // Group items by category for the outfit
  const heroImage = block.items[0]?.images[0]?.url;

  return (
    <section className={cn('py-6 px-4 md:px-0', className)}>
      <div className="bg-gray-50 rounded-2xl overflow-hidden">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>👀</span>
            <span>Complete the Look</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 p-4 pt-0">
          {/* Outfit Image */}
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-200">
            {heroImage && (
              <img
                src={heroImage}
                alt="Complete outfit"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Items List */}
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">Tap items to shop:</p>
            {block.items.slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-shadow text-left"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={item.images[0]?.url || '/images/placeholder.png'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.category.secondary}
                  </p>
                  <p className="text-sm text-gray-500">
                    ${item.price.amount} · {item.likesCount || 0} listings
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
