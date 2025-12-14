// Fashion Resale Discovery Platform - Trending API

import { NextRequest, NextResponse } from 'next/server';
import { dataService } from '@/services/dataService';
import { Region } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const region = (searchParams.get('region') as Region) || 'US';
    const type = searchParams.get('type') || 'searches'; // 'searches' or 'brands'

    let data;

    if (type === 'brands') {
      data = await dataService.getPopularBrands(region);
    } else {
      data = await dataService.getTrendingSearches(region);
    }

    return NextResponse.json({
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        region,
        type,
      },
    });
  } catch (error) {
    console.error('Trending API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRENDING_ERROR',
          message: 'Failed to fetch trending data',
        },
      },
      { status: 500 }
    );
  }
}
