/**
 * Storage writer utilities for saving agent workflow results
 * Use this module to persist session results to the file system
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type {
  Session,
  SessionIndexEntry,
  SessionIndex,
  AgentResult,
  SessionStatus,
} from '@/types/schema';

// Base path for results storage
const RESULTS_BASE_PATH = process.env.RESULTS_PATH || path.join(process.cwd(), '..', '.agent-results');
const SESSIONS_PATH = path.join(RESULTS_BASE_PATH, 'sessions');
const INDEX_PATH = path.join(RESULTS_BASE_PATH, 'index.json');

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Write JSON file
 */
async function writeJson(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Write markdown file
 */
async function writeMarkdown(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
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
 * Create a new session
 */
export async function createSession(params: {
  query: string;
  workflow?: string;
  tags?: string[];
}): Promise<Session> {
  const now = new Date();
  const id = uuidv4();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

  const session: Session = {
    id,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: 'running',
    query: params.query,
    workflow: params.workflow,
    tags: params.tags,
    agentsUsed: [],
  };

  // Create session directory
  const sessionPath = path.join(SESSIONS_PATH, dateStr, id);
  await ensureDir(sessionPath);
  await ensureDir(path.join(sessionPath, 'agents'));

  // Write session metadata
  await writeJson(path.join(sessionPath, 'session.json'), session);

  // Write query markdown
  await writeMarkdown(
    path.join(sessionPath, 'query.md'),
    `# Session Query\n\n${params.query}`
  );

  // Update index
  await addSessionToIndex({
    id,
    date: dateStr,
    createdAt: session.createdAt,
    status: session.status,
    query: params.query.slice(0, 200), // Truncate for preview
    tags: params.tags,
    agentsUsed: [],
    workflow: params.workflow,
  });

  return session;
}

/**
 * Add agent result to a session
 */
export async function addAgentResult(
  sessionId: string,
  date: string,
  agentResult: AgentResult,
  resultContent: string
): Promise<void> {
  const sessionPath = path.join(SESSIONS_PATH, date, sessionId);
  const agentPath = path.join(sessionPath, 'agents', agentResult.agentName);

  await ensureDir(agentPath);
  await ensureDir(path.join(agentPath, 'artifacts'));

  // Write agent metadata
  await writeJson(path.join(agentPath, 'metadata.json'), agentResult);

  // Write result markdown
  await writeMarkdown(path.join(agentPath, 'result.md'), resultContent);

  // Update session metadata
  const session = await readJson<Session>(path.join(sessionPath, 'session.json'));
  if (session) {
    if (!session.agentsUsed) session.agentsUsed = [];
    if (!session.agentsUsed.includes(agentResult.agentName)) {
      session.agentsUsed.push(agentResult.agentName);
    }
    session.updatedAt = new Date().toISOString();
    await writeJson(path.join(sessionPath, 'session.json'), session);

    // Update index
    await updateSessionInIndex(sessionId, {
      agentsUsed: session.agentsUsed,
    });
  }
}

/**
 * Complete a session
 */
export async function completeSession(
  sessionId: string,
  date: string,
  params: {
    status: SessionStatus;
    summary?: string;
    totalTokens?: number;
  }
): Promise<void> {
  const sessionPath = path.join(SESSIONS_PATH, date, sessionId);
  const session = await readJson<Session>(path.join(sessionPath, 'session.json'));

  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  // Calculate duration
  const startTime = new Date(session.createdAt).getTime();
  const endTime = Date.now();
  const duration = endTime - startTime;

  // Update session
  session.status = params.status;
  session.updatedAt = new Date().toISOString();
  session.duration = duration;
  session.summary = params.summary;
  session.totalTokens = params.totalTokens;

  await writeJson(path.join(sessionPath, 'session.json'), session);

  // Write summary if provided
  if (params.summary) {
    await writeMarkdown(
      path.join(sessionPath, 'summary.md'),
      `# Session Summary\n\n${params.summary}`
    );
  }

  // Update index
  await updateSessionInIndex(sessionId, {
    status: params.status,
  });
}

/**
 * Add session to index
 */
async function addSessionToIndex(entry: SessionIndexEntry): Promise<void> {
  const index = await getIndex();
  index.sessions.unshift(entry); // Add to beginning
  index.totalSessions = index.sessions.length;
  index.lastUpdated = new Date().toISOString();
  await writeJson(INDEX_PATH, index);
}

/**
 * Update session in index
 */
async function updateSessionInIndex(
  sessionId: string,
  updates: Partial<SessionIndexEntry>
): Promise<void> {
  const index = await getIndex();
  const sessionIndex = index.sessions.findIndex((s) => s.id === sessionId);

  if (sessionIndex !== -1) {
    index.sessions[sessionIndex] = {
      ...index.sessions[sessionIndex],
      ...updates,
    };
    index.lastUpdated = new Date().toISOString();
    await writeJson(INDEX_PATH, index);
  }
}

/**
 * Get or create index
 */
async function getIndex(): Promise<SessionIndex> {
  const index = await readJson<SessionIndex>(INDEX_PATH);
  if (!index) {
    const newIndex: SessionIndex = {
      schemaVersion: '1.0.0',
      lastUpdated: new Date().toISOString(),
      totalSessions: 0,
      sessions: [],
    };
    await ensureDir(RESULTS_BASE_PATH);
    await writeJson(INDEX_PATH, newIndex);
    return newIndex;
  }
  return index;
}

/**
 * Helper: Generate a sample session for testing
 */
export async function createSampleSession(): Promise<string> {
  const session = await createSession({
    query: 'Analyze the codebase architecture and identify potential improvements',
    workflow: 'analysis',
    tags: ['architecture', 'code-review'],
  });

  const date = session.createdAt.split('T')[0];

  // Add research agent result
  await addAgentResult(
    session.id,
    date,
    {
      agentName: 'research',
      model: 'haiku',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: 'completed',
      category: 'technical',
      toolsUsed: ['Glob', 'Grep', 'Read'],
      tokensUsed: { input: 1500, output: 800 },
    },
    `# Research Findings

## Architecture Overview
The codebase follows a modular architecture with clear separation of concerns.

## Key Components
- **Skills**: Auto-discovered modules in \`.claude/skills/\`
- **Agents**: Subagent definitions in \`.claude/agents/\`
- **Commands**: Slash commands in \`.claude/commands/\`

## Recommendations
1. Consider adding more comprehensive test coverage
2. Documentation could be enhanced for agent interactions
`
  );

  // Add implementation agent result
  await addAgentResult(
    session.id,
    date,
    {
      agentName: 'implementation',
      model: 'sonnet',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: 'completed',
      category: 'technical',
      toolsUsed: ['Edit', 'Write'],
      filesModified: ['src/components/Dashboard.tsx'],
      tokensUsed: { input: 2200, output: 1500 },
    },
    `# Implementation Changes

## Files Modified
- \`src/components/Dashboard.tsx\`: Added new statistics display

## Summary
Implemented the suggested improvements from the research phase.
`
  );

  // Complete session
  await completeSession(session.id, date, {
    status: 'completed',
    summary: 'Successfully analyzed codebase and implemented recommended changes.',
    totalTokens: 6000,
  });

  return session.id;
}
