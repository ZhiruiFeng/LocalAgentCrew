# LocalAgentCrew Architecture

## Overview

LocalAgentCrew is a multi-agent orchestration framework built for Claude Code. It provides specialized AI agents that collaborate to handle complex tasks across technical development, productivity, and business analysis domains.

## Current System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Query (Claude Code)                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│           Hook Interception (.claudecode/settings.json)          │
│                    userPromptSubmit hook                         │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                Hook Handler (hook-handler.js)                    │
│  • Gathers context (git branch, mentioned files)                 │
│  • Determines if orchestration needed                            │
│  • Detects [USAGE] prefix for session tracking                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Orchestrator (orchestrator.js)                  │
│  • Analyzes query against 15 agent triggers                      │
│  • Calculates relevance scores                                   │
│  • Detects predefined workflows                                  │
│  • Generates execution plan                                      │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Routing Decision                            │
├─────────────────┬───────────────────┬───────────────────────────┤
│  Single Agent   │   Multi-Agent     │       Workflow            │
│     Route       │  (parallel/seq)   │    (multi-stage)          │
└─────────────────┴───────────────────┴───────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              Formatted Agent Instructions (ANSI colors)          │
│                           ↓                                      │
│                  Main Claude Instance                            │
│              Executes agents per plan                            │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
LocalAgentCrew/
├── .claudecode/                         # Claude Code configuration
│   ├── settings.json                    # Hook configuration
│   └── agents/                          # Agent system
│       ├── config.json                  # Main configuration (15 agents, workflows)
│       ├── README.md                    # Quick reference
│       ├── COLOR_SCHEME.md              # Visual design documentation
│       ├── prompts/                     # Agent instruction templates (15 files)
│       │   ├── research.txt
│       │   ├── implementation.txt
│       │   ├── testing.txt
│       │   ├── debug.txt
│       │   ├── documentation.txt
│       │   ├── performance.txt
│       │   ├── security.txt
│       │   ├── writing-assistant.txt
│       │   ├── task-management.txt
│       │   ├── research-assistant.txt
│       │   ├── market-researcher.txt
│       │   ├── competitor-analyst.txt
│       │   ├── customer-insights.txt
│       │   ├── trend-forecaster.txt
│       │   └── swot-analyst.txt
│       ├── scripts/                     # Core orchestration engine
│       │   ├── orchestrator.js          # Agent routing logic
│       │   ├── hook-handler.js          # Prompt interception
│       │   ├── usage-tracker.js         # Session tracking
│       │   ├── colors.js                # ANSI color utilities
│       │   └── test-colors.js           # Color preview tool
│       └── workflows/                   # Predefined workflows (6 files)
│           ├── market-analysis-comprehensive.json
│           ├── market-entry-analysis.json
│           ├── competitive-intelligence.json
│           ├── code-review.json
│           ├── bug-fix.json
│           └── feature-complete.json
├── docs/                                # Documentation (NEW)
├── AGENT_SYSTEM.md                      # Comprehensive system docs
├── README.md                            # Project overview
└── LICENSE
```

## Agent Categories

### Technical Agents (7)
| Agent | Color | Triggers | Purpose |
|-------|-------|----------|---------|
| Research | Cyan | how does, what is, explain, analyze | Code exploration, documentation |
| Implementation | Green | implement, create, add feature, build | Code writing, feature development |
| Debug | Red | debug, fix bug, error, not working | Error analysis, bug fixing |
| Testing | Yellow | test, unit test, coverage | Test writing, validation |
| Security | Bright Red | security, vulnerability, auth | Security review, vulnerability detection |
| Performance | Magenta | optimize, performance, slow | Performance analysis, optimization |
| Documentation | Blue | document, write docs, readme | Documentation writing |

### Productivity Agents (3)
| Agent | Color | Triggers | Purpose |
|-------|-------|----------|---------|
| Writing Assistant | Purple | write email, draft, compose | Content writing, proofreading |
| Task Management | Orange | organize tasks, create plan | Task planning, scheduling |
| Research Assistant | Teal | research, summarize, compare | Information gathering, synthesis |

### Business/Market Analysis Agents (5)
| Agent | Color | Triggers | Purpose |
|-------|-------|----------|---------|
| Market Researcher | Bright Cyan | market research, market size | Market data collection, analysis |
| Competitor Analyst | Bright Yellow | competitor analysis, benchmark | Competitive intelligence |
| Customer Insights | Bright Magenta | customer analysis, buyer persona | Customer segmentation, personas |
| Trend Forecaster | Bright Green | forecast, predict, trends | Trend analysis, predictions |
| SWOT Analyst | Bright Blue | swot analysis, strategic analysis | Strategic assessment |

## Core Components

### 1. Hook Handler (`hook-handler.js`)
- **Entry Point**: Intercepts user prompts via `userPromptSubmit` hook
- **Responsibilities**:
  - Gather execution context (git branch, file mentions)
  - Filter trivial queries
  - Detect multi-agent indicators
  - Format colorized output

### 2. Orchestrator (`orchestrator.js`)
- **Brain**: Routes queries to appropriate agents
- **Responsibilities**:
  - Load configuration from `config.json`
  - Analyze queries against trigger keywords
  - Calculate relevance scores
  - Detect predefined workflows
  - Generate execution plans

### 3. Usage Tracker (`usage-tracker.js`)
- **Session Tracking**: Handles `[USAGE]` prefix queries
- **Creates**:
  - `questions/` - Stored prompts
  - `interactions/` - Conversation logs
  - `results/` - Artifacts folders

### 4. Configuration (`config.json`)
```json
{
  "orchestration": {
    "enabled": true,
    "mode": "auto",
    "parallel_execution": true,
    "max_concurrent_agents": 3
  },
  "routing": {
    "strategy": "keyword_match",
    "fallback_agent": "research",
    "multi_agent_threshold": 2
  }
}
```

## Execution Strategies

### Single Agent
Direct routing to one specialized agent based on trigger match.

### Multi-Agent (Parallel)
Multiple agents work concurrently (max 3 by default).

### Multi-Agent (Sequential)
Agents run one after another with dependency chains.

### Workflow Execution
Multi-stage execution with stage dependencies:
- `feature-complete`: research → implementation → QA → finalization
- `bug-fix`: debug → testing
- `code-review`: security + performance + testing → documentation
- `market-analysis-comprehensive`: research → intelligence → strategic

## Data Flow

```
User Query → Hook → Orchestrator → Agent Selection → Prompt Template → Claude Execution
                                                                            │
                                                    ┌───────────────────────┘
                                                    ▼
                                          Aggregated Results
```

## Configuration Files

| File | Purpose | Size |
|------|---------|------|
| `settings.json` | Hook configuration | 167B |
| `config.json` | Agent & workflow config | 13.5KB |
| `orchestrator.js` | Routing logic | 365 lines |
| `hook-handler.js` | Prompt interception | 245 lines |
| `usage-tracker.js` | Session tracking | 202 lines |
| `colors.js` | ANSI utilities | 230 lines |

## Current Limitations

1. **No actual subagent spawning** - Uses prompt templates, not real Claude subagents
2. **Hook-based only** - Doesn't use Claude Code's native Skills system
3. **Single model** - No model tiering (Opus/Sonnet/Haiku)
4. **No API/Database** - Results not persisted to external systems
5. **No web interface** - No visualization dashboard
6. **Legacy directory structure** - Uses `.claudecode/` instead of `.claude/`

---

*Last Updated: January 2026*
*Based on codebase analysis of LocalAgentCrew repository*
