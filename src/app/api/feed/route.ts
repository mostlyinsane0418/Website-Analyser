// Fashion Resale Discovery Platform - Discovery Feed API

import { NextRequest, NextResponse } from 'next/server';
import { dataService } from '@/services/dataService';
import { Region } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const region = (searchParams.get('region') as Region) || 'US';
    const userId = searchParams.get('userId') || undefined;

    const feed = await dataService.getDiscoveryFeed(region, userId);

    return NextResponse.json({
      success: true,
      data: feed,
      metadata: {
        timestamp: new Date().toISOString(),
        region,
        blocksCount: feed.blocks.length,
      },
    });
  } catch (error) {
    console.error('Feed API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FEED_ERROR',
          message: 'Failed to fetch discovery feed',
        },
      },
      { status: 500 }
    );
  }
}
