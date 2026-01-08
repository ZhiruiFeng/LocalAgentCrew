'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FilterOptions, ResultsStatistics, SessionStatus } from '@/types/schema';
import { X, Calendar, Check } from 'lucide-react';
import { AGENT_DEFINITIONS } from '@/types/schema';

interface FiltersPanelProps {
  currentFilters: FilterOptions;
  onClose: () => void;
  statistics: ResultsStatistics;
}

const STATUS_OPTIONS: SessionStatus[] = ['running', 'completed', 'failed', 'cancelled'];
const AGENT_NAMES = Object.keys(AGENT_DEFINITIONS);

export default function FiltersPanel({
  currentFilters,
  onClose,
  statistics,
}: FiltersPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedStatuses, setSelectedStatuses] = useState<SessionStatus[]>(
    currentFilters.status || []
  );
  const [selectedAgents, setSelectedAgents] = useState<string[]>(
    currentFilters.agents || []
  );
  const [startDate, setStartDate] = useState(currentFilters.dateRange?.start || '');
  const [endDate, setEndDate] = useState(currentFilters.dateRange?.end || '');

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Status filter
    if (selectedStatuses.length > 0) {
      params.set('status', selectedStatuses.join(','));
    } else {
      params.delete('status');
    }

    // Agent filter
    if (selectedAgents.length > 0) {
      params.set('agent', selectedAgents.join(','));
    } else {
      params.delete('agent');
    }

    // Date range filter
    if (startDate && endDate) {
      params.set('startDate', startDate);
      params.set('endDate', endDate);
    } else {
      params.delete('startDate');
      params.delete('endDate');
    }

    router.push(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedAgents([]);
    setStartDate('');
    setEndDate('');
    router.push('/');
  };

  const toggleStatus = (status: SessionStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleAgent = (agent: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agent)
        ? prev.filter((a) => a !== agent)
        : [...prev, agent]
    );
  };

  // Quick date presets
  const setDatePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  return (
    <aside className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white">Filters</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Status Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Status
          </h3>
          <div className="space-y-2">
            {STATUS_OPTIONS.map((status) => (
              <label
                key={status}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedStatuses.includes(status)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  onClick={() => toggleStatus(status)}
                >
                  {selectedStatuses.includes(status) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {status}
                </span>
                <span className="ml-auto text-xs text-gray-400">
                  {statistics.sessionsByStatus[status]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <Calendar className="h-4 w-4 inline mr-2" />
            Date Range
          </h3>
          <div className="space-y-3">
            {/* Quick presets */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDatePreset(7)}
                className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Last 7 days
              </button>
              <button
                onClick={() => setDatePreset(30)}
                className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Last 30 days
              </button>
              <button
                onClick={() => setDatePreset(90)}
                className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Last 90 days
              </button>
            </div>
            {/* Custom range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">Start</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded border-0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">End</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded border-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Agent Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Agents
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {AGENT_NAMES.map((agent) => {
              const count = statistics.sessionsByAgent[agent] || 0;
              return (
                <label
                  key={agent}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedAgents.includes(agent)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    onClick={() => toggleAgent(agent)}
                  >
                    {selectedAgents.includes(agent) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {agent}
                  </span>
                  <span className="ml-auto text-xs text-gray-400">{count}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={applyFilters}
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={clearFilters}
          className="w-full py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
        >
          Clear All
        </button>
      </div>
    </aside>
  );
}
