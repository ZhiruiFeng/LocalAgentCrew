import { NextRequest, NextResponse } from 'next/server';
import { getSessions, getSessionIndex } from '@/lib/storage';
import type { FilterOptions, SessionStatus } from '@/types/schema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Build filter options from query params
    const filters: FilterOptions = {};

    const status = searchParams.get('status');
    if (status) {
      filters.status = status.split(',') as SessionStatus[];
    }

    const agents = searchParams.get('agents');
    if (agents) {
      filters.agents = agents.split(',');
    }

    const tags = searchParams.get('tags');
    if (tags) {
      filters.tags = tags.split(',');
    }

    const workflow = searchParams.get('workflow');
    if (workflow) {
      filters.workflow = workflow;
    }

    const search = searchParams.get('search');
    if (search) {
      filters.searchQuery = search;
    }

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      filters.dateRange = { start: startDate, end: endDate };
    }

    // Fetch sessions
    const sessions = await getSessions(Object.keys(filters).length > 0 ? filters : undefined);

    return NextResponse.json({
      success: true,
      data: sessions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sessions',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
