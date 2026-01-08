import { NextResponse } from 'next/server';
import { getFileTree } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fileTree = await getFileTree();

    return NextResponse.json({
      success: true,
      data: fileTree,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching file tree:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch file tree',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
