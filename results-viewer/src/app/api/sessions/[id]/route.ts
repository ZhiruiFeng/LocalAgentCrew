import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date') || undefined;

    const session = await getSession(id, date);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch session',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
