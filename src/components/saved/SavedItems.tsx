'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Listing, Collection } from '@/types';
import { ListingCard } from '@/components/ui/Card';
import { useSavedItemsStore, useUserPreferencesStore } from '@/store';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SavedItemsProps {
  className?: string;
}

export default function SavedItems({ className }: SavedItemsProps) {
  const router = useRouter();
  const { currency } = useUserPreferencesStore();
  const {
    savedItems,
    collections,
    toggleSave,
    createCollection,
    deleteCollection,
    removeFromCollection,
  } = useSavedItemsStore();

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'collections'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    fetchSavedListings();
  }, [savedItems]);

  const fetchSavedListings = async () => {
    if (savedItems.length === 0) {
      setListings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch all saved listings
      const results = await Promise.all(
        savedItems.map(async (id) => {
          const response = await fetch(`/api/listings/${id}`);
          const data = await response.json();
          return data.success ? data.data.listing : null;
        })
      );
      setListings(results.filter((l): l is Listing => l !== null));
    } catch (error) {
      console.error('Failed to fetch saved listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListingClick = (id: string) => {
    router.push(`/listing/${id}`);
  };

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      createCollection(newCollectionName.trim());
      setNewCollectionName('');
      setShowCreateModal(false);
    }
  };

  if (isLoading) {
    return <SavedItemsSkeleton />;
  }

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Saved</h1>

          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'pb-2 text-sm font-medium transition-colors border-b-2',
                activeTab === 'all'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              All Saved ({savedItems.length})
            </button>
            <button
              onClick={() => setActiveTab('collections')}
              className={cn(
                'pb-2 text-sm font-medium transition-colors border-b-2',
                activeTab === 'collections'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              Collections ({collections.length})
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'all' ? (
          // All Saved Items
          savedItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  brand={listing.brand}
                  price={(currency === 'USD' || currency === 'GBP' ? listing.price.converted[currency] : listing.price.amount) || listing.price.amount}
                  currency={currency}
                  imageUrl={listing.images[0]?.url || '/images/placeholder.png'}
                  platform={listing.sourcePlatform}
                  condition={listing.condition}
                  likesCount={listing.likesCount}
                  isSaved={true}
                  onSave={toggleSave}
                  onClick={handleListingClick}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No saved items yet"
              description="Start exploring and save items you love!"
              actionLabel="Start Browsing"
              onAction={() => router.push('/')}
            />
          )
        ) : (
          // Collections
          <div>
            {/* Create Collection Button */}
            <div className="mb-6">
              <Button
                onClick={() => setShowCreateModal(true)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Create Collection
              </Button>
            </div>

            {collections.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {collections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    listings={listings.filter(l => collection.items.includes(l.id))}
                    onDelete={() => deleteCollection(collection.id)}
                    onClick={() => router.push(`/saved/collection/${collection.id}`)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No collections yet"
                description="Create a collection to organize your saved items"
                actionLabel="Create Collection"
                onAction={() => setShowCreateModal(true)}
              />
            )}
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Collection</h2>
            <input
              type="text"
              placeholder="Collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-black"
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateCollection} className="flex-1">
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Collection Card
interface CollectionCardProps {
  collection: Collection;
  listings: Listing[];
  onDelete: () => void;
  onClick: () => void;
}

function CollectionCard({ collection, listings, onDelete, onClick }: CollectionCardProps) {
  const previewImages = listings.slice(0, 4);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this collection?')) {
      onDelete();
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Preview Grid */}
      <div className="aspect-square grid grid-cols-2 gap-0.5 bg-gray-100">
        {previewImages.length > 0 ? (
          previewImages.map((listing, i) => (
            <div key={listing.id} className="bg-gray-200">
              <img
                src={listing.images[0]?.url || '/images/placeholder.png'}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))
        ) : (
          <div className="col-span-2 row-span-2 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{collection.name}</h3>
          <p className="text-sm text-gray-500">{collection.items.length} items</p>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Empty State
interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 mb-6">{description}</p>
      <Button onClick={onAction}>{actionLabel}</Button>
    </div>
  );
}

// Loading Skeleton
function SavedItemsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="h-8 w-32 bg-gray-200 rounded mb-4" />
        <div className="flex gap-4">
          <div className="h-6 w-24 bg-gray-200 rounded" />
          <div className="h-6 w-24 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/5] bg-gray-200 rounded-2xl mb-3" />
              <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-5 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
