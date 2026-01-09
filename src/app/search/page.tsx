'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchResults as SearchResultsType, SearchFilters } from '@/types';
import SearchResults from '@/components/search/SearchResults';
import { SearchInput } from '@/components/ui/Input';
import { useSearchStore, useUserPreferencesStore } from '@/store';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { region } = useUserPreferencesStore();
  const { setQuery, setFilters, filters, addToHistory, addRecentSearch } = useSearchStore();

  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResultsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (query) {
      setQuery(query);
      addRecentSearch(query);
      fetchResults(query, 1);
    }
  }, [query, region]);

  const fetchResults = async (searchQuery: string, pageNum: number) => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: pageNum.toString(),
        limit: '20',
        region,
      });

      // Add filters
      if (filters.brand) params.set('brand', filters.brand);
      if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.condition?.length) params.set('condition', filters.condition.join(','));
      if (filters.platform?.length) params.set('platform', filters.platform.join(','));
      if (filters.freeShipping) params.set('freeShipping', 'true');

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      if (data.success) {
        if (pageNum === 1) {
          setResults(data.data);
        } else {
          setResults((prev) =>
            prev
              ? {
                  ...data.data,
                  items: [...prev.items, ...data.data.items],
                }
              : data.data
          );
        }
        setPage(pageNum);
        addToHistory(searchQuery, filters);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (newQuery: string) => {
    if (newQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(newQuery.trim())}`);
    }
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (query) {
      fetchResults(query, 1);
    }
  };

  const handleLoadMore = () => {
    if (query && results && page < results.totalPages) {
      fetchResults(query, page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 md:top-16">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <SearchInput
            defaultValue={query}
            onSearch={handleSearch}
            onCameraClick={() => router.push('/visual-search')}
          />
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-6">
        {results ? (
          <SearchResults
            results={results}
            query={query}
            isLoading={isLoading}
            onLoadMore={handleLoadMore}
            onFilterChange={handleFilterChange}
          />
        ) : isLoading ? (
          <SearchSkeleton />
        ) : (
          <EmptySearchState />
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchSkeleton() {
  return (
    <div className="animate-pulse px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-200 rounded-full" />
          <div className="h-10 w-32 bg-gray-200 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] bg-gray-200 rounded-2xl mb-3" />
            <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
            <div className="h-5 w-full bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptySearchState() {
  const { recentSearches } = useSearchStore();
  const router = useRouter();

  return (
    <div className="px-4 py-12 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Search for anything</h2>
      <p className="text-gray-500 mb-6">
        Try searching for brands, styles, or specific items
      </p>

      {recentSearches.length > 0 && (
        <div className="max-w-md mx-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-3 text-left">Recent Searches</h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.slice(0, 5).map((search) => (
              <button
                key={search}
                onClick={() => router.push(`/search?q=${encodeURIComponent(search)}`)}
                className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 max-w-md mx-auto">
        <h3 className="text-sm font-medium text-gray-700 mb-3 text-left">Trending Searches</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'Vintage Levi\'s',
            'Miu Miu',
            'Y2K',
            'Platform sneakers',
            'The Row',
            'Baggy jeans',
          ].map((search) => (
            <button
              key={search}
              onClick={() => router.push(`/search?q=${encodeURIComponent(search)}`)}
              className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {search}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
