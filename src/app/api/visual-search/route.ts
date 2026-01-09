// Fashion Resale Discovery Platform - Visual Search API

import { NextRequest, NextResponse } from 'next/server';
import { dataService } from '@/services/dataService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, imageBase64 } = body;

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Either imageUrl or imageBase64 is required',
          },
        },
        { status: 400 }
      );
    }

    // In production, handle base64 image upload to storage
    // For now, use the URL directly or a placeholder
    const searchImageUrl = imageUrl || 'https://placeholder.com/image';

    const result = await dataService.visualSearch(searchImageUrl);

    // Convert Map to object for JSON serialization
    const matchingListingsObject: Record<string, unknown[]> = {};
    result.matchingListings.forEach((listings, itemId) => {
      matchingListingsObject[itemId] = listings;
    });

    return NextResponse.json({
      success: true,
      data: {
        originalImage: result.originalImage,
        identifiedItems: result.identifiedItems,
        matchingListings: matchingListingsObject,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        itemsIdentified: result.identifiedItems.length,
      },
    });
  } catch (error) {
    console.error('Visual Search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VISUAL_SEARCH_ERROR',
          message: 'Failed to perform visual search',
        },
      },
      { status: 500 }
    );
  }
}
