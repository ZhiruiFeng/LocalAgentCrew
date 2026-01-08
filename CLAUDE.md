# LocalAgentCrew Project Guide

## Project Overview

LocalAgentCrew is a multi-agent orchestration framework for Claude Code. It provides 15 specialized AI agents across technical development, productivity, and business analysis domains that collaborate on complex tasks.

## Architecture

The system uses a hybrid architecture during migration:
- **Legacy**: Hook-based orchestration in `.claudecode/`
- **Modern**: Skills and subagents in `.claude/`

## Directory Structure

```
LocalAgentCrew/
├── .claude/                   # Modern Claude Code configuration
│   ├── settings.json          # Main settings
│   ├── agents/                # Native subagent definitions
│   └── skills/                # Auto-discovered skills
├── .claudecode/               # Legacy system (being migrated)
│   └── agents/
│       ├── config.json        # Agent configuration
│       ├── prompts/           # Agent templates
│       ├── scripts/           # Orchestration engine
│       └── workflows/         # Workflow definitions
├── docs/                      # Documentation
└── CLAUDE.md                  # This file
```

## Agent Categories

### Technical (7 agents)
- **research**: Code exploration, documentation lookup
- **implementation**: Feature development, code writing
- **debug**: Error analysis, bug fixing
- **testing**: Test writing, validation
- **security**: Vulnerability detection, security review
- **performance**: Optimization, profiling
- **documentation**: Docs writing, API documentation

### Productivity (3 agents)
- **writing-assistant**: Content creation, proofreading
- **task-management**: Planning, scheduling
- **research-assistant**: Information gathering, synthesis

### Business (5 agents)
- **market-researcher**: Market data, industry analysis
- **competitor-analyst**: Competitive intelligence
- **customer-insights**: Customer segmentation, personas
- **trend-forecaster**: Trend analysis, predictions
- **swot-analyst**: Strategic assessment

## Code Conventions

### ANSI Colors
Use the color scheme defined in `.claudecode/agents/COLOR_SCHEME.md`:
- Cyan: Research agents
- Green: Implementation, success
- Red: Debug, errors
- Yellow: Testing, warnings
- Blue: Documentation, information
- Magenta: Performance

### Agent Prompt Templates
Follow the structure in existing prompts:
1. Role declaration
2. Query/context placeholders: `{query}`, `{context}`
3. Capabilities section
4. Output format specification

### Skills Format (SKILL.md)
```yaml
---
name: skill-name
description: What this skill does
---

# Skill Title

Instructions for Claude when using this skill...
```

### Subagent Format (.claude/agents/*.md)
```yaml
---
name: agent-name
description: Agent purpose
model: haiku|sonnet|opus
tools:
  - Glob
  - Grep
  - Read
---

Agent role and instructions...
```

## Development Commands

```bash
# Test color scheme preview
node .claudecode/agents/scripts/test-colors.js

# Test orchestrator routing
node .claudecode/agents/scripts/orchestrator.js "your query here"

# View agent configuration
cat .claudecode/agents/config.json | jq '.agents | keys'
```

## Usage Tracking

Prefix queries with `[USAGE]` to enable session tracking:
```
[USAGE] Analyze the codebase architecture
```

This creates timestamped folders in:
- `questions/` - Stored prompts
- `interactions/` - Conversation logs
- `results/` - Output artifacts

## Model Tiering Strategy

When using subagents, apply this model selection:
| Task Type | Model | Reasoning |
|-----------|-------|-----------|
| Exploration, simple analysis | haiku | Fast, cost-effective |
| Complex implementation | sonnet | Balance of speed and capability |
| Strategic planning, orchestration | opus | Maximum reasoning |

## Agent Results Storage

Results from agent workflows are stored in `.agent-results/` with a structured schema:

```
.agent-results/
├── sessions/
│   └── [YYYY-MM-DD]/
│       └── [session-id]/
│           ├── session.json     # Session metadata
│           ├── query.md         # Original query
│           ├── summary.md       # Generated summary
│           └── agents/
│               └── [agent-name]/
│                   ├── metadata.json  # Agent result metadata
│                   ├── result.md      # Agent output
│                   └── artifacts/     # Generated files
├── index.json                   # Global session index
└── schema/
    └── v1.json                  # Schema definition
```

### Results Viewer Web App

A Next.js web application for viewing results is available in `results-viewer/`:

```bash
cd results-viewer
npm install
npm run dev
```

Features:
- Dashboard with statistics
- Session browser with filters (status, date, agents, tags)
- File browser for direct access to results
- Detailed session view with agent outputs

Deploy to Vercel by pointing to the `results-viewer` directory.

## Migration Status

- [x] Phase 1: Directory structure (.claude/) - COMPLETED
- [x] Phase 1: CLAUDE.md conventions - COMPLETED
- [x] Phase 2: Skills migration (15/15 skills) - COMPLETED
- [x] Phase 3: Native subagents (11 agents with model tiering) - COMPLETED
- [ ] Phase 4: API integration - PENDING
- [x] Phase 5: Web dashboard - COMPLETED (results-viewer/)

### Current Subagent Model Tiering
| Model | Agents | Use Case |
|-------|--------|----------|
| Haiku | research, testing, documentation, writing-assistant, task-planner, research-assistant | Fast, cost-effective tasks |
| Sonnet | implementation, debug, security, performance, market-analyst | Complex reasoning tasks |

## Key Files

| File | Purpose |
|------|---------|
| `.claude/settings.json` | Modern settings (Skills enabled) |
| `.claudecode/agents/config.json` | Agent definitions, workflows |
| `.claudecode/agents/scripts/orchestrator.js` | Routing logic |
| `.claudecode/agents/scripts/hook-handler.js` | Prompt interception |
| `docs/MIGRATION_ROADMAP.md` | Detailed upgrade plan |
