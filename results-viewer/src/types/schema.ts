/**
 * LocalAgentCrew Results Schema Types v1
 * TypeScript interfaces for agent workflow results storage
 */

// Session status types
export type SessionStatus = 'running' | 'completed' | 'failed' | 'cancelled';
export type AgentStatus = 'running' | 'completed' | 'failed' | 'skipped';
export type ModelTier = 'haiku' | 'sonnet' | 'opus';
export type AgentCategory = 'technical' | 'productivity' | 'business';

// Token usage tracking
export interface TokenUsage {
  input: number;
  output: number;
}

// Agent result metadata
export interface AgentResult {
  agentName: string;
  model?: ModelTier;
  createdAt: string;
  completedAt?: string;
  status: AgentStatus;
  inputContext?: string;
  tokensUsed?: TokenUsage;
  toolsUsed?: string[];
  filesModified?: string[];
  error?: string;
  category?: AgentCategory;
}

// Full agent result with content
export interface AgentResultWithContent extends AgentResult {
  resultContent?: string;  // Content from result.md
  artifacts?: string[];    // List of artifact file paths
}

// Session metadata
export interface Session {
  id: string;
  createdAt: string;
  updatedAt?: string;
  status: SessionStatus;
  query: string;
  workflow?: string;
  tags?: string[];
  agentsUsed?: string[];
  summary?: string;
  duration?: number;
  totalTokens?: number;
}

// Full session with agent results
export interface SessionWithResults extends Session {
  agents: AgentResultWithContent[];
  queryContent?: string;   // Content from query.md
  summaryContent?: string; // Content from summary.md
}

// Index file structure
export interface SessionIndex {
  schemaVersion: string;
  lastUpdated: string;
  totalSessions: number;
  sessions: SessionIndexEntry[];
}

// Lightweight session entry for the index
export interface SessionIndexEntry {
  id: string;
  date: string;           // YYYY-MM-DD format for directory
  createdAt: string;
  status: SessionStatus;
  query: string;          // Truncated query for preview
  tags?: string[];
  agentsUsed?: string[];
  workflow?: string;
}

// Filter options for the viewer
export interface FilterOptions {
  dateRange?: {
    start: string;
    end: string;
  };
  status?: SessionStatus[];
  agents?: string[];
  tags?: string[];
  workflow?: string;
  searchQuery?: string;
}

// File tree node for navigation
export interface FileTreeNode {
  name: string;
  path: string;
  type: 'directory' | 'file';
  children?: FileTreeNode[];
  metadata?: {
    sessionId?: string;
    agentName?: string;
    fileType?: 'session' | 'agent' | 'artifact' | 'schema';
  };
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Statistics for dashboard
export interface ResultsStatistics {
  totalSessions: number;
  sessionsByStatus: Record<SessionStatus, number>;
  sessionsByAgent: Record<string, number>;
  sessionsByDate: { date: string; count: number }[];
  totalTokensUsed: number;
  averageSessionDuration: number;
  mostUsedAgents: { agent: string; count: number }[];
  recentSessions: SessionIndexEntry[];
}

// Agent definitions (for reference)
export const AGENT_DEFINITIONS = {
  // Technical agents
  research: { category: 'technical', defaultModel: 'haiku' },
  implementation: { category: 'technical', defaultModel: 'sonnet' },
  debug: { category: 'technical', defaultModel: 'sonnet' },
  testing: { category: 'technical', defaultModel: 'haiku' },
  security: { category: 'technical', defaultModel: 'sonnet' },
  performance: { category: 'technical', defaultModel: 'sonnet' },
  documentation: { category: 'technical', defaultModel: 'haiku' },

  // Productivity agents
  'writing-assistant': { category: 'productivity', defaultModel: 'haiku' },
  'task-planner': { category: 'productivity', defaultModel: 'haiku' },
  'research-assistant': { category: 'productivity', defaultModel: 'haiku' },

  // Business agents
  'market-analyst': { category: 'business', defaultModel: 'sonnet' },
  'competitor-analyst': { category: 'business', defaultModel: 'sonnet' },
  'customer-insights': { category: 'business', defaultModel: 'sonnet' },
  'trend-forecaster': { category: 'business', defaultModel: 'sonnet' },
  'swot-analyst': { category: 'business', defaultModel: 'sonnet' },
} as const;

export type AgentName = keyof typeof AGENT_DEFINITIONS;
