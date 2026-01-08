import { NextResponse } from 'next/server';
import { getStatistics } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const statistics = await getStatistics();

    return NextResponse.json({
      success: true,
      data: statistics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
