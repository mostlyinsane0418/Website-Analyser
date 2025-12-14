// Fashion Resale Discovery Platform - Single Listing API

import { NextRequest, NextResponse } from 'next/server';
import { dataService } from '@/services/dataService';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'Listing ID is required',
          },
        },
        { status: 400 }
      );
    }

    const listing = await dataService.getListing(id);

    if (!listing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Listing not found',
          },
        },
        { status: 404 }
      );
    }

    // Also fetch seller info
    const seller = await dataService.getSeller(listing.sellerId);

    return NextResponse.json({
      success: true,
      data: {
        listing,
        seller,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Listing API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LISTING_ERROR',
          message: 'Failed to fetch listing',
        },
      },
      { status: 500 }
    );
  }
}
