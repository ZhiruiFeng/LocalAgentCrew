'use client';

import type { ResultsStatistics } from '@/types/schema';
import {
  LayoutDashboard,
  FolderTree,
  List,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentView: 'dashboard' | 'sessions' | 'files';
  onViewChange: (view: 'dashboard' | 'sessions' | 'files') => void;
  statistics: ResultsStatistics;
}

export default function Sidebar({
  isOpen,
  onToggle,
  currentView,
  onViewChange,
  statistics,
}: SidebarProps) {
  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'sessions' as const,
      label: 'Sessions',
      icon: List,
      badge: statistics.totalSessions,
    },
    {
      id: 'files' as const,
      label: 'File Browser',
      icon: FolderTree,
      badge: null,
    },
  ];

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-16'
      } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        {isOpen && (
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-blue-500" />
            <span className="font-bold text-gray-900 dark:text-white">
              AgentCrew
            </span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center ${
              isOpen ? 'px-3' : 'justify-center'
            } py-2.5 rounded-lg transition-colors ${
              currentView === item.id
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={!isOpen ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {isOpen && (
              <>
                <span className="ml-3 font-medium">{item.label}</span>
                {item.badge !== null && (
                  <span className="ml-auto bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Status Summary */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Completed</span>
              <span className="text-green-600 dark:text-green-400 font-medium">
                {statistics.sessionsByStatus.completed}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Running</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {statistics.sessionsByStatus.running}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Failed</span>
              <span className="text-red-600 dark:text-red-400 font-medium">
                {statistics.sessionsByStatus.failed}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
