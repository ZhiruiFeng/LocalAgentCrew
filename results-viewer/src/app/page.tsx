import { Suspense } from 'react';
import { getStatistics, getSessions, getFileTree } from '@/lib/storage';
import Dashboard from '@/components/Dashboard';
import type { FilterOptions } from '@/types/schema';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    status?: string;
    agent?: string;
    tag?: string;
    workflow?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    view?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Build filter options from query params
  const filters: FilterOptions = {};

  if (params.status) {
    filters.status = params.status.split(',') as FilterOptions['status'];
  }
  if (params.agent) {
    filters.agents = params.agent.split(',');
  }
  if (params.tag) {
    filters.tags = params.tag.split(',');
  }
  if (params.workflow) {
    filters.workflow = params.workflow;
  }
  if (params.search) {
    filters.searchQuery = params.search;
  }
  if (params.startDate && params.endDate) {
    filters.dateRange = {
      start: params.startDate,
      end: params.endDate,
    };
  }

  // Fetch data
  const [stats, sessions, fileTree] = await Promise.all([
    getStatistics(),
    getSessions(Object.keys(filters).length > 0 ? filters : undefined),
    getFileTree(),
  ]);

  const currentView = params.view || 'dashboard';

  return (
    <main className="flex-1">
      <Suspense fallback={<LoadingState />}>
        <Dashboard
          statistics={stats}
          sessions={sessions}
          fileTree={fileTree}
          currentFilters={filters}
          currentView={currentView}
        />
      </Suspense>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading results...</p>
      </div>
    </div>
  );
}
