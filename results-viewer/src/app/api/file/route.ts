import { NextRequest, NextResponse } from 'next/server';
import { getFileContent } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        {
          success: false,
          error: 'File path is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const content = await getFileContent(filePath);

    if (content === null) {
      return NextResponse.json(
        {
          success: false,
          error: 'File not found or access denied',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      content,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read file',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
