'use client';

import { useState } from 'react';
import { Listing, SearchResults as SearchResultsType, SearchFilters, Platform } from '@/types';
import { ListingCard } from '@/components/ui/Card';
import { useSavedItemsStore, useSearchStore } from '@/store';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PLATFORM_CONFIG, CONDITION_DISPLAY } from '@/lib/constants';

interface SearchResultsProps {
  results: SearchResultsType;
  query?: string;
  isLoading?: boolean;
  onLoadMore?: () => void;
  onFilterChange?: (filters: SearchFilters) => void;
  className?: string;
}

export default function SearchResults({
  results,
  query,
  isLoading,
  onLoadMore,
  onFilterChange,
  className,
}: SearchResultsProps) {
  const router = useRouter();
  const { isSaved, toggleSave } = useSavedItemsStore();
  const { filters, updateFilter } = useSearchStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleListingClick = (id: string) => {
    router.push(`/listing/${id}`);
  };

  const handleSortChange = (sortBy: string) => {
    onFilterChange?.({ ...filters });
  };

  return (
    <div className={cn('', className)}>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-0">
        <div>
          {query && (
            <h1 className="text-xl font-bold text-gray-900">
              Results for &ldquo;{query}&rdquo;
            </h1>
          )}
          <p className="text-sm text-gray-500">
            {results.totalCount.toLocaleString()} items found
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>

          {/* Sort Dropdown */}
          <select
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 border-none focus:ring-2 focus:ring-black"
          >
            <option value="relevance">Relevance</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 px-4 md:px-0">
          {filters.brand && (
            <FilterChip
              label={`Brand: ${filters.brand}`}
              onRemove={() => updateFilter('brand', undefined)}
            />
          )}
          {filters.minPrice !== undefined && (
            <FilterChip
              label={`Min: $${filters.minPrice}`}
              onRemove={() => updateFilter('minPrice', undefined)}
            />
          )}
          {filters.maxPrice !== undefined && (
            <FilterChip
              label={`Max: $${filters.maxPrice}`}
              onRemove={() => updateFilter('maxPrice', undefined)}
            />
          )}
          {filters.condition?.map((c) => (
            <FilterChip
              key={c}
              label={CONDITION_DISPLAY[c]?.shortLabel || c}
              onRemove={() => updateFilter('condition', filters.condition?.filter(x => x !== c))}
            />
          ))}
        </div>
      )}

      {/* Filter Panel */}
      {isFilterOpen && (
        <FilterPanel
          facets={results.facets}
          filters={filters}
          onFilterChange={(newFilters) => {
            Object.entries(newFilters).forEach(([key, value]) => {
              updateFilter(key as keyof SearchFilters, value);
            });
            onFilterChange?.(newFilters);
          }}
          onClose={() => setIsFilterOpen(false)}
        />
      )}

      {/* Results Grid */}
      {results.items.length > 0 ? (
        <>
          <div
            className={cn(
              'px-4 md:px-0',
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'space-y-4'
            )}
          >
            {results.items.map((listing) => (
              <ListingCard
                key={listing.id}
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
            ))}
          </div>

          {/* Load More */}
          {results.page < results.totalPages && (
            <div className="flex justify-center mt-8 mb-20">
              <button
                onClick={onLoadMore}
                disabled={isLoading}
                className="px-8 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState query={query} />
      )}
    </div>
  );
}

// Filter Chip Component
interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
      {label}
      <button
        onClick={onRemove}
        className="p-0.5 hover:bg-gray-200 rounded-full transition-colors"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

// Filter Panel Component
interface FilterPanelProps {
  facets: SearchResultsType['facets'];
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onClose: () => void;
}

function FilterPanel({ facets, filters, onFilterChange, onClose }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 md:relative md:bg-transparent md:z-auto">
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl md:static md:shadow-none md:w-full md:mb-6 md:p-4 md:bg-gray-50 md:rounded-xl">
        <div className="flex items-center justify-between p-4 border-b md:border-none">
          <h3 className="font-bold text-gray-900">Filters</h3>
          <button onClick={onClose} className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Price Range */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Price</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.minPrice || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, minPrice: parseFloat(e.target.value) || undefined })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={localFilters.maxPrice || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: parseFloat(e.target.value) || undefined })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Condition */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Condition</h4>
            <div className="space-y-2">
              {Object.entries(CONDITION_DISPLAY).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.condition?.includes(key as never) || false}
                    onChange={(e) => {
                      const current = localFilters.condition || [];
                      setLocalFilters({
                        ...localFilters,
                        condition: e.target.checked
                          ? [...current, key as never]
                          : current.filter(c => c !== key),
                      });
                    }}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{value.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Platform</h4>
            <div className="space-y-2">
              {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.platform?.includes(key as Platform) || false}
                    onChange={(e) => {
                      const current = localFilters.platform || [];
                      setLocalFilters({
                        ...localFilters,
                        platform: e.target.checked
                          ? [...current, key as Platform]
                          : current.filter(p => p !== key),
                      });
                    }}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{config.displayName}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brands (from facets) */}
          {facets.brands.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Popular Brands</h4>
              <div className="flex flex-wrap gap-2">
                {facets.brands.slice(0, 10).map(({ name, count }) => (
                  <button
                    key={name}
                    onClick={() => setLocalFilters({ ...localFilters, brand: name })}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm transition-colors',
                      localFilters.brand === name
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {name} ({count})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Free Shipping */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.freeShipping || false}
                onChange={(e) => setLocalFilters({ ...localFilters, freeShipping: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Free Shipping Only</span>
            </label>
          </div>
        </div>

        {/* Apply Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleApply}
            className="w-full py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  query?: string;
}

function EmptyState({ query }: EmptyStateProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h2>
      <p className="text-gray-500 mb-6 max-w-md">
        {query
          ? `We couldn't find any items matching "${query}". Try adjusting your search or filters.`
          : 'Try adjusting your filters or search for something else.'}
      </p>
      <button
        onClick={() => router.push('/')}
        className="px-6 py-2 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
      >
        Browse All Items
      </button>
    </div>
  );
}
