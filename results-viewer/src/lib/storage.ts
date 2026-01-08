/**
 * Storage utilities for reading agent workflow results
 * Works with local file system for both Node.js and Vercel deployment
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  Session,
  SessionWithResults,
  SessionIndex,
  SessionIndexEntry,
  AgentResult,
  AgentResultWithContent,
  FileTreeNode,
  FilterOptions,
  ResultsStatistics,
  SessionStatus
} from '@/types/schema';

// Base path for results storage
const RESULTS_BASE_PATH = process.env.RESULTS_PATH || path.join(process.cwd(), '..', '.agent-results');
const SESSIONS_PATH = path.join(RESULTS_BASE_PATH, 'sessions');
const INDEX_PATH = path.join(RESULTS_BASE_PATH, 'index.json');

/**
 * Check if a path exists
 */
async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read and parse JSON file
 */
async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * Read markdown file
 */
async function readMarkdown(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Get the global session index
 */
export async function getSessionIndex(): Promise<SessionIndex> {
  const index = await readJson<SessionIndex>(INDEX_PATH);
  if (!index) {
    return {
      schemaVersion: '1.0.0',
      lastUpdated: new Date().toISOString(),
      totalSessions: 0,
      sessions: []
    };
  }
  return index;
}

/**
 * Get all sessions with optional filtering
 */
export async function getSessions(filters?: FilterOptions): Promise<SessionIndexEntry[]> {
  const index = await getSessionIndex();
  let sessions = [...index.sessions];

  if (!filters) return sessions;

  // Apply date range filter
  if (filters.dateRange) {
    const start = new Date(filters.dateRange.start).getTime();
    const end = new Date(filters.dateRange.end).getTime();
    sessions = sessions.filter(s => {
      const created = new Date(s.createdAt).getTime();
      return created >= start && created <= end;
    });
  }

  // Apply status filter
  if (filters.status && filters.status.length > 0) {
    sessions = sessions.filter(s => filters.status!.includes(s.status));
  }

  // Apply agents filter
  if (filters.agents && filters.agents.length > 0) {
    sessions = sessions.filter(s =>
      s.agentsUsed?.some(a => filters.agents!.includes(a))
    );
  }

  // Apply tags filter
  if (filters.tags && filters.tags.length > 0) {
    sessions = sessions.filter(s =>
      s.tags?.some(t => filters.tags!.includes(t))
    );
  }

  // Apply workflow filter
  if (filters.workflow) {
    sessions = sessions.filter(s => s.workflow === filters.workflow);
  }

  // Apply search query filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    sessions = sessions.filter(s =>
      s.query.toLowerCase().includes(query) ||
      s.tags?.some(t => t.toLowerCase().includes(query))
    );
  }

  return sessions;
}

/**
 * Get a single session with full details
 */
export async function getSession(sessionId: string, date?: string): Promise<SessionWithResults | null> {
  // If date not provided, search through dates
  let sessionPath: string | null = null;

  if (date) {
    sessionPath = path.join(SESSIONS_PATH, date, sessionId);
  } else {
    // Search through date directories
    const exists = await pathExists(SESSIONS_PATH);
    if (!exists) return null;

    const dates = await fs.readdir(SESSIONS_PATH);
    for (const d of dates) {
      const potentialPath = path.join(SESSIONS_PATH, d, sessionId);
      if (await pathExists(potentialPath)) {
        sessionPath = potentialPath;
        break;
      }
    }
  }

  if (!sessionPath || !(await pathExists(sessionPath))) {
    return null;
  }

  // Read session metadata
  const sessionMeta = await readJson<Session>(path.join(sessionPath, 'session.json'));
  if (!sessionMeta) return null;

  // Read query and summary content
  const queryContent = await readMarkdown(path.join(sessionPath, 'query.md'));
  const summaryContent = await readMarkdown(path.join(sessionPath, 'summary.md'));

  // Read agent results
  const agentsDir = path.join(sessionPath, 'agents');
  const agents: AgentResultWithContent[] = [];

  if (await pathExists(agentsDir)) {
    const agentDirs = await fs.readdir(agentsDir);
    for (const agentName of agentDirs) {
      const agentPath = path.join(agentsDir, agentName);
      const stats = await fs.stat(agentPath);
      if (!stats.isDirectory()) continue;

      const metadata = await readJson<AgentResult>(path.join(agentPath, 'metadata.json'));
      const resultContent = await readMarkdown(path.join(agentPath, 'result.md'));

      // List artifacts if any
      const artifactsDir = path.join(agentPath, 'artifacts');
      let artifacts: string[] = [];
      if (await pathExists(artifactsDir)) {
        artifacts = await fs.readdir(artifactsDir);
      }

      agents.push({
        agentName,
        status: 'completed',
        createdAt: sessionMeta.createdAt,
        ...metadata,
        resultContent: resultContent || undefined,
        artifacts
      });
    }
  }

  return {
    ...sessionMeta,
    agents,
    queryContent: queryContent || undefined,
    summaryContent: summaryContent || undefined
  };
}

/**
 * Build file tree structure for navigation
 */
export async function getFileTree(): Promise<FileTreeNode> {
  const root: FileTreeNode = {
    name: '.agent-results',
    path: RESULTS_BASE_PATH,
    type: 'directory',
    children: []
  };

  if (!(await pathExists(RESULTS_BASE_PATH))) {
    return root;
  }

  async function buildTree(dirPath: string, node: FileTreeNode): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const child: FileTreeNode = {
        name: entry.name,
        path: fullPath,
        type: entry.isDirectory() ? 'directory' : 'file'
      };

      // Add metadata based on path structure
      const relativePath = path.relative(RESULTS_BASE_PATH, fullPath);
      const parts = relativePath.split(path.sep);

      if (parts[0] === 'sessions' && parts.length >= 3) {
        child.metadata = { sessionId: parts[2] };
        if (parts.length >= 5 && parts[3] === 'agents') {
          child.metadata.agentName = parts[4];
          child.metadata.fileType = 'agent';
        } else {
          child.metadata.fileType = 'session';
        }
      } else if (parts[0] === 'schema') {
        child.metadata = { fileType: 'schema' };
      }

      if (entry.isDirectory()) {
        child.children = [];
        await buildTree(fullPath, child);
      }

      node.children!.push(child);
    }

    // Sort: directories first, then files, alphabetically
    node.children!.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  await buildTree(RESULTS_BASE_PATH, root);
  return root;
}

/**
 * Get statistics for the dashboard
 */
export async function getStatistics(): Promise<ResultsStatistics> {
  const index = await getSessionIndex();
  const sessions = index.sessions;

  // Initialize statistics
  const stats: ResultsStatistics = {
    totalSessions: sessions.length,
    sessionsByStatus: {
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0
    },
    sessionsByAgent: {},
    sessionsByDate: [],
    totalTokensUsed: 0,
    averageSessionDuration: 0,
    mostUsedAgents: [],
    recentSessions: sessions.slice(0, 10)
  };

  // Count by status
  for (const session of sessions) {
    stats.sessionsByStatus[session.status]++;

    // Count by agent
    if (session.agentsUsed) {
      for (const agent of session.agentsUsed) {
        stats.sessionsByAgent[agent] = (stats.sessionsByAgent[agent] || 0) + 1;
      }
    }
  }

  // Group by date
  const dateGroups: Record<string, number> = {};
  for (const session of sessions) {
    const date = session.date;
    dateGroups[date] = (dateGroups[date] || 0) + 1;
  }
  stats.sessionsByDate = Object.entries(dateGroups)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Most used agents
  stats.mostUsedAgents = Object.entries(stats.sessionsByAgent)
    .map(([agent, count]) => ({ agent, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return stats;
}

/**
 * Read a specific file's content
 */
export async function getFileContent(filePath: string): Promise<string | null> {
  // Ensure the path is within the results directory for security
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(RESULTS_BASE_PATH)) {
    return null;
  }

  if (!(await pathExists(normalizedPath))) {
    return null;
  }

  const stats = await fs.stat(normalizedPath);
  if (!stats.isFile()) {
    return null;
  }

  return await fs.readFile(normalizedPath, 'utf-8');
}

/**
 * Get all unique tags from sessions
 */
export async function getAllTags(): Promise<string[]> {
  const index = await getSessionIndex();
  const tagSet = new Set<string>();

  for (const session of index.sessions) {
    if (session.tags) {
      session.tags.forEach(tag => tagSet.add(tag));
    }
  }

  return Array.from(tagSet).sort();
}

/**
 * Get all unique workflows from sessions
 */
export async function getAllWorkflows(): Promise<string[]> {
  const index = await getSessionIndex();
  const workflowSet = new Set<string>();

  for (const session of index.sessions) {
    if (session.workflow) {
      workflowSet.add(session.workflow);
    }
  }

  return Array.from(workflowSet).sort();
}
