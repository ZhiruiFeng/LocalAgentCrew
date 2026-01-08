import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSession, getSessionIndex } from '@/lib/storage';
import { formatDistanceToNow, format } from 'date-fns';
import { ArrowLeft, Clock, Users, Tag, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: PageProps) {
  const { id } = await params;

  // Find session date from index
  const index = await getSessionIndex();
  const sessionEntry = index.sessions.find((s) => s.id === id);
  const date = sessionEntry?.date;

  const session = await getSession(id, date);

  if (!session) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/?view=sessions"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sessions
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {session.query}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className={`status-badge status-${session.status}`}>
                  {session.status}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  {format(new Date(session.createdAt), 'PPpp')}
                </span>
                {session.duration && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Duration: {Math.round(session.duration / 1000)}s
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {session.tags && session.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <Tag className="h-4 w-4 text-gray-400" />
              <div className="flex flex-wrap gap-1">
                {session.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Summary */}
        {session.summaryContent && (
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Summary
            </h2>
            <div className="prose dark:prose-invert max-w-none markdown-content">
              <ReactMarkdown>{session.summaryContent}</ReactMarkdown>
            </div>
          </section>
        )}

        {/* Agent Results */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Agent Results ({session.agents.length})
          </h2>

          {session.agents.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No agent results available
            </p>
          ) : (
            <div className="space-y-4">
              {session.agents.map((agent, index) => (
                <div
                  key={`${agent.agentName}-${index}`}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  {/* Agent Header */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {agent.agentName}
                      </span>
                      {agent.model && (
                        <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">
                          {agent.model}
                        </span>
                      )}
                      {agent.category && (
                        <span className={`text-xs px-2 py-0.5 rounded agent-${agent.category}`}>
                          {agent.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {agent.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : agent.status === 'failed' ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : null}
                      <span className={`status-badge status-${agent.status}`}>
                        {agent.status}
                      </span>
                    </div>
                  </div>

                  {/* Agent Content */}
                  <div className="p-4">
                    {agent.error ? (
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded">
                        {agent.error}
                      </div>
                    ) : agent.resultContent ? (
                      <div className="prose dark:prose-invert max-w-none markdown-content text-sm">
                        <ReactMarkdown>{agent.resultContent}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No result content available
                      </p>
                    )}

                    {/* Meta info */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                      {agent.tokensUsed && (
                        <span>
                          Tokens: {agent.tokensUsed.input} in / {agent.tokensUsed.output} out
                        </span>
                      )}
                      {agent.toolsUsed && agent.toolsUsed.length > 0 && (
                        <span>
                          Tools: {agent.toolsUsed.join(', ')}
                        </span>
                      )}
                      {agent.filesModified && agent.filesModified.length > 0 && (
                        <span>
                          Files: {agent.filesModified.length} modified
                        </span>
                      )}
                    </div>

                    {/* Artifacts */}
                    {agent.artifacts && agent.artifacts.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Artifacts
                        </h4>
                        <ul className="space-y-1">
                          {agent.artifacts.map((artifact) => (
                            <li
                              key={artifact}
                              className="text-sm text-gray-500 dark:text-gray-400"
                            >
                              {artifact}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Original Query */}
        {session.queryContent && (
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Original Query
            </h2>
            <div className="prose dark:prose-invert max-w-none markdown-content">
              <ReactMarkdown>{session.queryContent}</ReactMarkdown>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
