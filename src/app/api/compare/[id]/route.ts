// Fashion Resale Discovery Platform - Price Comparison API

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

    const comparison = await dataService.getPriceComparison(id);

    if (!comparison) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Listing not found for comparison',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: comparison,
      metadata: {
        timestamp: new Date().toISOString(),
        listingsCompared: comparison.listings.length,
      },
    });
  } catch (error) {
    console.error('Comparison API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'COMPARISON_ERROR',
          message: 'Failed to fetch price comparison',
        },
      },
      { status: 500 }
    );
  }
}
