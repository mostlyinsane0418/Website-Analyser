'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Listing, Seller, PriceComparison } from '@/types';
import ListingDetail from '@/components/listing/ListingDetail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ListingPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [comparison, setComparison] = useState<PriceComparison | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch listing and comparison in parallel
      const [listingResponse, comparisonResponse] = await Promise.all([
        fetch(`/api/listings/${id}`),
        fetch(`/api/compare/${id}`),
      ]);

      const listingData = await listingResponse.json();
      const comparisonData = await comparisonResponse.json();

      if (listingData.success) {
        setListing(listingData.data.listing);
        setSeller(listingData.data.seller);
      } else {
        setError(listingData.error?.message || 'Listing not found');
      }

      if (comparisonData.success) {
        setComparison(comparisonData.data);
      }
    } catch (err) {
      setError('Failed to load listing');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ListingSkeleton />;
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Listing not found'}
          </h1>
          <p className="text-gray-500 mb-6">
            This listing may have been removed or sold
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <ListingDetail
      listing={listing}
      seller={seller}
      comparison={comparison}
    />
  );
}

function ListingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-14 bg-white border-b border-gray-100" />
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-[4/5] bg-gray-200 rounded-2xl" />
          <div className="space-y-6">
            <div className="h-6 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="h-10 w-32 bg-gray-200 rounded" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gray-200 rounded-full" />
              <div className="h-6 w-16 bg-gray-200 rounded-full" />
            </div>
            <div className="h-24 bg-gray-200 rounded-xl" />
            <div className="h-12 bg-gray-200 rounded-full" />
            <div className="h-12 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
