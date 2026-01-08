/**
 * Script to generate sample session data for testing the results viewer
 * Run with: npx ts-node scripts/generate-sample-data.ts
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const RESULTS_PATH = path.join(__dirname, '..', '..', '.agent-results');
const SESSIONS_PATH = path.join(RESULTS_PATH, 'sessions');
const INDEX_PATH = path.join(RESULTS_PATH, 'index.json');

interface SessionIndex {
  schemaVersion: string;
  lastUpdated: string;
  totalSessions: number;
  sessions: SessionIndexEntry[];
}

interface SessionIndexEntry {
  id: string;
  date: string;
  createdAt: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  query: string;
  tags?: string[];
  agentsUsed?: string[];
  workflow?: string;
}

async function ensureDir(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function writeJson(filePath: string, data: unknown) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function writeMarkdown(filePath: string, content: string) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

const SAMPLE_QUERIES = [
  'Analyze the authentication system and identify security vulnerabilities',
  'Implement a new feature for user profile settings',
  'Debug the payment processing error in checkout flow',
  'Write comprehensive tests for the API endpoints',
  'Optimize database queries for better performance',
  'Document the REST API with OpenAPI specifications',
  'Research competitor pricing strategies',
  'Analyze customer feedback and generate insights',
];

const AGENT_CONFIGS = [
  { name: 'research', model: 'haiku', category: 'technical' },
  { name: 'implementation', model: 'sonnet', category: 'technical' },
  { name: 'debug', model: 'sonnet', category: 'technical' },
  { name: 'testing', model: 'haiku', category: 'technical' },
  { name: 'security', model: 'sonnet', category: 'technical' },
  { name: 'performance', model: 'sonnet', category: 'technical' },
  { name: 'documentation', model: 'haiku', category: 'technical' },
  { name: 'market-analyst', model: 'sonnet', category: 'business' },
  { name: 'research-assistant', model: 'haiku', category: 'productivity' },
];

const TAGS = ['feature', 'bugfix', 'security', 'performance', 'documentation', 'analysis'];
const WORKFLOWS = ['development', 'analysis', 'review', 'planning'];
const STATUSES: ('completed' | 'failed' | 'running')[] = ['completed', 'completed', 'completed', 'failed', 'running'];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSubset<T>(arr: T[], min = 1, max = 3): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateAgentResult(agentConfig: typeof AGENT_CONFIGS[0], query: string) {
  const tools = ['Glob', 'Grep', 'Read', 'Edit', 'Write', 'Bash'];
  return {
    metadata: {
      agentName: agentConfig.name,
      model: agentConfig.model,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: 'completed',
      category: agentConfig.category,
      toolsUsed: randomSubset(tools, 2, 4),
      tokensUsed: {
        input: Math.floor(Math.random() * 3000) + 500,
        output: Math.floor(Math.random() * 2000) + 200,
      },
    },
    content: `# ${agentConfig.name.charAt(0).toUpperCase() + agentConfig.name.slice(1)} Agent Results

## Task Analysis
Analyzed the following query: "${query}"

## Findings
- Finding 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
- Finding 2: Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
- Finding 3: Ut enim ad minim veniam, quis nostrud exercitation.

## Recommendations
1. Consider implementing additional validation
2. Review the error handling patterns
3. Update documentation accordingly

## Code References
- \`src/components/Example.tsx:42\`
- \`src/utils/helpers.ts:128\`
`,
  };
}

async function createSampleSession(daysAgo: number) {
  const id = uuidv4();
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const dateStr = date.toISOString().split('T')[0];

  const query = randomChoice(SAMPLE_QUERIES);
  const status = randomChoice(STATUSES);
  const tags = randomSubset(TAGS, 1, 3);
  const workflow = randomChoice(WORKFLOWS);
  const agents = randomSubset(AGENT_CONFIGS, 1, 4);

  const session = {
    id,
    createdAt: date.toISOString(),
    updatedAt: new Date().toISOString(),
    status,
    query,
    workflow,
    tags,
    agentsUsed: agents.map(a => a.name),
    summary: status === 'completed' ? 'Session completed successfully with all agent tasks finished.' : undefined,
    duration: Math.floor(Math.random() * 300000) + 30000,
    totalTokens: Math.floor(Math.random() * 10000) + 2000,
  };

  const sessionPath = path.join(SESSIONS_PATH, dateStr, id);

  // Write session files
  await writeJson(path.join(sessionPath, 'session.json'), session);
  await writeMarkdown(path.join(sessionPath, 'query.md'), `# Session Query\n\n${query}`);

  if (status === 'completed') {
    await writeMarkdown(
      path.join(sessionPath, 'summary.md'),
      `# Session Summary\n\n${session.summary}\n\n## Agents Used\n${agents.map(a => `- ${a.name}`).join('\n')}`
    );
  }

  // Write agent results
  for (const agentConfig of agents) {
    const { metadata, content } = generateAgentResult(agentConfig, query);
    const agentPath = path.join(sessionPath, 'agents', agentConfig.name);
    await writeJson(path.join(agentPath, 'metadata.json'), metadata);
    await writeMarkdown(path.join(agentPath, 'result.md'), content);
    await ensureDir(path.join(agentPath, 'artifacts'));
  }

  return {
    id,
    date: dateStr,
    createdAt: session.createdAt,
    status: session.status,
    query: query.slice(0, 200),
    tags,
    agentsUsed: session.agentsUsed,
    workflow,
  } as SessionIndexEntry;
}

async function main() {
  console.log('Generating sample data...\n');

  // Ensure base directories exist
  await ensureDir(RESULTS_PATH);
  await ensureDir(SESSIONS_PATH);
  await ensureDir(path.join(RESULTS_PATH, 'schema'));

  const sessions: SessionIndexEntry[] = [];

  // Generate sessions for the past 14 days
  for (let daysAgo = 0; daysAgo < 14; daysAgo++) {
    const sessionsForDay = Math.floor(Math.random() * 3) + 1; // 1-3 sessions per day
    for (let i = 0; i < sessionsForDay; i++) {
      const entry = await createSampleSession(daysAgo);
      sessions.push(entry);
      console.log(`Created session: ${entry.id.slice(0, 8)}... (${entry.date}) - ${entry.status}`);
    }
  }

  // Sort sessions by date (newest first)
  sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Write index
  const index: SessionIndex = {
    schemaVersion: '1.0.0',
    lastUpdated: new Date().toISOString(),
    totalSessions: sessions.length,
    sessions,
  };
  await writeJson(INDEX_PATH, index);

  console.log(`\nGenerated ${sessions.length} sample sessions`);
  console.log(`Results stored in: ${RESULTS_PATH}`);
}

main().catch(console.error);
