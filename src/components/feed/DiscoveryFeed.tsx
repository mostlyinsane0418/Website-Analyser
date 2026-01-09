'use client';

import { useState, useEffect } from 'react';
import { DiscoveryFeed as DiscoveryFeedType } from '@/types';
import { useUserPreferencesStore } from '@/store';
import FeedBlock, { ThemeBlock, CompleteTheLookBlock } from './FeedBlock';
import { SearchInput } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface DiscoveryFeedProps {
  initialFeed?: DiscoveryFeedType;
  className?: string;
}

export default function DiscoveryFeed({ initialFeed, className }: DiscoveryFeedProps) {
  const router = useRouter();
  const { region } = useUserPreferencesStore();
  const [feed, setFeed] = useState<DiscoveryFeedType | null>(initialFeed || null);
  const [isLoading, setIsLoading] = useState(!initialFeed);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialFeed) {
      fetchFeed();
    }
  }, [region, initialFeed]);

  const fetchFeed = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/feed?region=${region}`);
      const data = await response.json();

      if (data.success) {
        setFeed(data.data);
      } else {
        setError(data.error?.message || 'Failed to load feed');
      }
    } catch {
      setError('Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleVisualSearch = () => {
    router.push('/visual-search');
  };

  if (isLoading) {
    return <FeedSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchFeed}
          className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!feed) return null;

  return (
    <div className={cn('pb-20', className)}>
      {/* Header with Search */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 hidden md:block">
              For You
            </h1>
            <div className="flex-1">
              <SearchInput
                onSearch={handleSearch}
                onCameraClick={handleVisualSearch}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Quick Filters */}
      <div className="px-4 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2">
          {['All', 'Tops', 'Dresses', 'Jeans', 'Shoes', 'Bags', 'Vintage', 'Designer'].map(
            (filter, i) => (
              <button
                key={filter}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  i === 0
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
                onClick={() => i > 0 && router.push(`/search?category=${filter.toLowerCase()}`)}
              >
                {filter}
              </button>
            )
          )}
        </div>
      </div>

      {/* Feed Blocks */}
      <div className="max-w-7xl mx-auto">
        {feed.blocks.map((block, index) => {
          // Use special components for certain block types
          if (block.type === 'theme_collection') {
            return <ThemeBlock key={block.id} block={block} />;
          }

          if (block.type === 'complete_the_look') {
            return <CompleteTheLookBlock key={block.id} block={block} />;
          }

          // Standard block
          return <FeedBlock key={block.id} block={block} />;
        })}
      </div>

      {/* Style Quiz CTA */}
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 md:p-8 text-center text-white">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Find Your Style in 30 Seconds
            </h2>
            <p className="text-white/80 mb-4">
              Take our quick style quiz for personalized recommendations
            </p>
            <button className="px-6 py-3 bg-white text-purple-600 font-medium rounded-full hover:bg-gray-100 transition-colors">
              Take the Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function FeedSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="h-12 bg-gray-200 rounded-full w-full max-w-xl" />
      </div>

      {/* Quick filters skeleton */}
      <div className="px-4 py-3 flex gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-20 bg-gray-200 rounded-full" />
        ))}
      </div>

      {/* Feed blocks skeleton */}
      {[...Array(4)].map((_, blockIndex) => (
        <div key={blockIndex} className="py-6 px-4">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-44">
                <div className="aspect-[4/5] bg-gray-200 rounded-2xl mb-3" />
                <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                <div className="h-5 w-full bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
