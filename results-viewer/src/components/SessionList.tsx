'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type { SessionIndexEntry } from '@/types/schema';
import { Clock, Tag, Users, ArrowRight } from 'lucide-react';

interface SessionListProps {
  sessions: SessionIndexEntry[];
  compact?: boolean;
}

export default function SessionList({ sessions, compact = false }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No sessions found</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Run agent workflows to see results here
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-${compact ? '3' : '4'}`}>
      {sessions.map((session) => (
        <Link
          key={session.id}
          href={`/session/${session.id}`}
          className={`block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${
            compact ? 'p-4' : 'p-5'
          } hover:border-blue-300 dark:hover:border-blue-600 transition-colors group`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Query */}
              <p className={`${compact ? 'text-sm' : 'text-base'} font-medium text-gray-900 dark:text-white truncate`}>
                {session.query}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                {/* Status */}
                <span className={`status-badge status-${session.status}`}>
                  {session.status}
                </span>

                {/* Date */}
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                </span>

                {/* Agents used */}
                {session.agentsUsed && session.agentsUsed.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Users className="h-3 w-3" />
                    {session.agentsUsed.length} agent{session.agentsUsed.length !== 1 ? 's' : ''}
                  </span>
                )}

                {/* Workflow */}
                {session.workflow && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {session.workflow}
                  </span>
                )}
              </div>

              {/* Tags */}
              {session.tags && session.tags.length > 0 && !compact && (
                <div className="flex items-center gap-2 mt-3">
                  <Tag className="h-3 w-3 text-gray-400" />
                  <div className="flex flex-wrap gap-1">
                    {session.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Agents chips */}
              {session.agentsUsed && session.agentsUsed.length > 0 && !compact && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {session.agentsUsed.slice(0, 5).map((agent) => (
                    <span
                      key={agent}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded"
                    >
                      {agent}
                    </span>
                  ))}
                  {session.agentsUsed.length > 5 && (
                    <span className="text-xs text-gray-400">
                      +{session.agentsUsed.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Arrow */}
            <ArrowRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors flex-shrink-0" />
          </div>
        </Link>
      ))}
    </div>
  );
}
