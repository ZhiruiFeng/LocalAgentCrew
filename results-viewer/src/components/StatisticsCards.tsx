'use client';

import type { ResultsStatistics } from '@/types/schema';
import { Activity, CheckCircle, XCircle, Clock, Users, Zap } from 'lucide-react';

interface StatisticsCardsProps {
  statistics: ResultsStatistics;
}

export default function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const cards = [
    {
      title: 'Total Sessions',
      value: statistics.totalSessions,
      icon: Activity,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Completed',
      value: statistics.sessionsByStatus.completed,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-500',
    },
    {
      title: 'Failed',
      value: statistics.sessionsByStatus.failed,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-500',
    },
    {
      title: 'Running',
      value: statistics.sessionsByStatus.running,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.title}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-6 w-6 ${card.iconColor}`} />
            </div>
          </div>
        </div>
      ))}

      {/* Most Used Agents Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 md:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Most Used Agents
          </h3>
        </div>
        {statistics.mostUsedAgents.length > 0 ? (
          <div className="space-y-3">
            {statistics.mostUsedAgents.slice(0, 5).map((item) => (
              <div key={item.agent} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 truncate">
                  {item.agent}
                </span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${
                        (item.count / statistics.mostUsedAgents[0].count) * 100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 w-8 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No agent usage data available yet
          </p>
        )}
      </div>

      {/* Sessions by Date Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 md:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Sessions by Date
          </h3>
        </div>
        {statistics.sessionsByDate.length > 0 ? (
          <div className="space-y-2">
            {statistics.sessionsByDate.slice(0, 7).map((item) => (
              <div key={item.date} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.date}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.count} session{item.count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No sessions recorded yet
          </p>
        )}
      </div>
    </div>
  );
}
