'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { VisualSearchResult, IdentifiedItem, Listing } from '@/types';
import { ListingCard } from '@/components/ui/Card';
import { useSavedItemsStore } from '@/store';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface VisualSearchProps {
  className?: string;
}

export default function VisualSearch({ className }: VisualSearchProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<VisualSearchResult | null>(null);
  const [selectedItem, setSelectedItem] = useState<IdentifiedItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isSaved, toggleSave } = useSavedItemsStore();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        setError(null);
        setResults(null);
        setSelectedItem(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleUrlInput = useCallback((url: string) => {
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      setImagePreview(url);
      setError(null);
      setResults(null);
      setSelectedItem(null);
    }
  }, []);

  const handleSearch = async () => {
    if (!imagePreview) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/visual-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imagePreview.startsWith('data:') ? undefined : imagePreview,
          imageBase64: imagePreview.startsWith('data:') ? imagePreview : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Convert matchingListings back to Map
        const result: VisualSearchResult = {
          ...data.data,
          matchingListings: new Map(Object.entries(data.data.matchingListings)),
        };
        setResults(result);

        // Auto-select first item
        if (result.identifiedItems.length > 0) {
          setSelectedItem(result.identifiedItems[0]);
        }
      } else {
        setError(data.error?.message || 'Failed to analyze image');
      }
    } catch {
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleListingClick = (id: string) => {
    router.push(`/listing/${id}`);
  };

  const getMatchingListings = (): Listing[] => {
    if (!results || !selectedItem) return [];
    return (results.matchingListings.get(selectedItem.id) || []) as Listing[];
  };

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Search by Photo</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!results ? (
          // Upload Section
          <div className="space-y-6">
            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
                imagePreview
                  ? 'border-black bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-80 mx-auto rounded-xl object-contain"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      setResults(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    Upload a photo to search
                  </p>
                  <p className="text-sm text-gray-500">
                    Drop an image here or click to browse
                  </p>
                </div>
              )}
            </div>

            {/* URL Input */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Or paste an image URL</p>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                onChange={(e) => handleUrlInput(e.target.value)}
                className="w-full max-w-md px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-center text-red-600 text-sm">{error}</div>
            )}

            {/* Search Button */}
            {imagePreview && (
              <div className="text-center">
                <Button
                  onClick={handleSearch}
                  isLoading={isSearching}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {isSearching ? 'Analyzing...' : 'Find Similar Items'}
                </Button>
              </div>
            )}

            {/* Tips */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-3">Tips for best results</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Use clear, well-lit photos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Focus on one clothing item at a time
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Screenshot outfits from Instagram or Pinterest
                </li>
              </ul>
            </div>
          </div>
        ) : (
          // Results Section
          <div className="space-y-6">
            {/* Original Image with Identified Items */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="relative inline-block">
                <img
                  src={imagePreview || ''}
                  alt="Searched image"
                  className="max-h-64 rounded-xl object-contain"
                />
                {/* Identified item markers */}
                {results.identifiedItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={cn(
                      'absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                      selectedItem?.id === item.id
                        ? 'bg-black text-white scale-110'
                        : 'bg-white text-black border-2 border-black hover:scale-105'
                    )}
                    style={{
                      left: `${(item.boundingBox.x / 400) * 100}%`,
                      top: `${(item.boundingBox.y / 500) * 100}%`,
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* Identified Items List */}
              <div className="mt-4 flex flex-wrap gap-2">
                {results.identifiedItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                      selectedItem?.id === item.id
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <span className="mr-2">{index + 1}</span>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    <span className="ml-2 text-xs opacity-70">
                      {Math.round(item.confidence * 100)}% match
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Item Results */}
            {selectedItem && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Similar {selectedItem.type}s
                </h2>

                {getMatchingListings().length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {getMatchingListings().map((listing) => (
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
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No matching items found for this piece.
                  </p>
                )}
              </div>
            )}

            {/* Search Again */}
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setImagePreview(null);
                  setResults(null);
                  setSelectedItem(null);
                }}
              >
                Search Another Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
