'use client';

import { useState } from 'react';
import type { ResultsStatistics, SessionIndexEntry, FileTreeNode, FilterOptions } from '@/types/schema';
import Sidebar from './Sidebar';
import Header from './Header';
import StatisticsCards from './StatisticsCards';
import SessionList from './SessionList';
import FileTreeView from './FileTreeView';
import FiltersPanel from './FiltersPanel';

interface DashboardProps {
  statistics: ResultsStatistics;
  sessions: SessionIndexEntry[];
  fileTree: FileTreeNode;
  currentFilters: FilterOptions;
  currentView: string;
}

export default function Dashboard({
  statistics,
  sessions,
  fileTree,
  currentFilters,
  currentView,
}: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState<'dashboard' | 'sessions' | 'files'>(
    currentView as 'dashboard' | 'sessions' | 'files'
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentView={view}
        onViewChange={setView}
        statistics={statistics}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleFilters={() => setFiltersOpen(!filtersOpen)}
          filtersActive={Object.keys(currentFilters).length > 0}
        />

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Panel */}
          <main className="flex-1 overflow-y-auto p-6">
            {view === 'dashboard' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Agent Results Dashboard
                </h1>
                <StatisticsCards statistics={statistics} />
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Recent Sessions
                  </h2>
                  <SessionList sessions={statistics.recentSessions} compact />
                </div>
              </div>
            )}

            {view === 'sessions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    All Sessions
                  </h1>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {sessions.length} session{sessions.length !== 1 ? 's' : ''} found
                  </span>
                </div>
                <SessionList sessions={sessions} />
              </div>
            )}

            {view === 'files' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  File Browser
                </h1>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <FileTreeView fileTree={fileTree} />
                </div>
              </div>
            )}
          </main>

          {/* Filters Panel */}
          {filtersOpen && (
            <FiltersPanel
              currentFilters={currentFilters}
              onClose={() => setFiltersOpen(false)}
              statistics={statistics}
            />
          )}
        </div>
      </div>
    </div>
  );
}
