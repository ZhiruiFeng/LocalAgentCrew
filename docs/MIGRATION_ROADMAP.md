# Migration Roadmap: Modernizing LocalAgentCrew

## Overview

This roadmap outlines the steps to modernize LocalAgentCrew from its current hook-based architecture to leverage the latest Claude Code features including Skills, native subagents, and model tiering.

---

## Phase 1: Foundation Updates

### 1.1 Directory Structure Migration

**Goal**: Adopt Claude Code standard directory conventions.

**Current**:
```
.claudecode/
├── settings.json
└── agents/
    ├── config.json
    ├── prompts/
    ├── scripts/
    └── workflows/
```

**Target**:
```
.claude/
├── settings.json              # Main config
├── settings.local.json        # Local overrides (gitignored)
├── CLAUDE.md                  # Project conventions
├── agents/                    # Native subagent definitions
│   ├── research.md
│   ├── implementation.md
│   └── ...
├── skills/                    # Skills (auto-discovered)
│   ├── market-analysis/
│   │   └── SKILL.md
│   └── code-review/
│       └── SKILL.md
└── commands/                  # Slash commands (optional)
    └── workflow.md

# Legacy (can be removed after migration)
.claudecode/                   # Archive or remove
```

**Migration Steps**:
1. Create `.claude/` directory
2. Move `settings.json` to `.claude/settings.json`
3. Create `CLAUDE.md` with project conventions
4. Keep `.claudecode/` temporarily for backwards compatibility
5. Update `.gitignore` for `settings.local.json`

---

### 1.2 Create CLAUDE.md

**Purpose**: Project-level conventions that Claude automatically reads.

```markdown
# LocalAgentCrew Project Guide

## Project Overview
Multi-agent orchestration framework for Claude Code with 15 specialized agents across technical, productivity, and business domains.

## Directory Structure
- `.claude/agents/` - Native subagent definitions
- `.claude/skills/` - Auto-discovered skills
- `docs/` - Project documentation

## Development Commands
- `node .claude/scripts/test-colors.js` - Preview color scheme
- `node .claude/scripts/orchestrator.js "query"` - Test routing

## Code Conventions
- Use ANSI colors for terminal output (see COLOR_SCHEME.md)
- Agent prompts follow template in existing prompts/*.txt files

## Testing
[Add test commands as project evolves]
```

---

## Phase 2: Skills Migration

### 2.1 Convert Prompts to Skills

**Goal**: Transform agent prompts into Skills for automatic discovery.

**Current Format** (`prompts/research.txt`):
```
You are the RESEARCH AGENT...
{query}
{context}
```

**Target Format** (`.claude/skills/research/SKILL.md`):
```yaml
---
name: research
description: Analyzes codebase, searches documentation, explores architecture patterns
triggers:
  - how does
  - what is
  - explain
  - analyze
---

# Research Skill

You are the **Research Agent** specialized in code exploration and documentation.

## Capabilities
- Code search using Glob and Grep
- Documentation lookup
- Dependency analysis
- Architecture exploration

## Process
1. Use Glob and Grep tools extensively
2. Read relevant files to understand implementations
3. Identify key files, functions, and patterns
4. Provide structured findings

## Output Format
Use cyan color theme for headers.

### Relevant Files
[List discovered files]

### Key Implementations
[Describe core logic]

### Dependencies
[List external dependencies]
```

**Migration Order** (by usage frequency):
1. `research.txt` → `.claude/skills/research/SKILL.md`
2. `implementation.txt` → `.claude/skills/implementation/SKILL.md`
3. `debug.txt` → `.claude/skills/debug/SKILL.md`
4. `testing.txt` → `.claude/skills/testing/SKILL.md`
5. Continue for all 15 agents...

---

### 2.2 Skills Directory Structure

```
.claude/skills/
├── research/
│   └── SKILL.md
├── implementation/
│   └── SKILL.md
├── debug/
│   └── SKILL.md
├── testing/
│   └── SKILL.md
├── security/
│   └── SKILL.md
├── performance/
│   └── SKILL.md
├── documentation/
│   └── SKILL.md
├── writing-assistant/
│   └── SKILL.md
├── task-management/
│   └── SKILL.md
├── research-assistant/
│   └── SKILL.md
├── market-analysis/          # Combines multiple market agents
│   ├── SKILL.md
│   └── templates/
│       ├── market-research-template.md
│       ├── competitor-analysis-template.md
│       └── swot-template.md
└── workflows/                # Workflow skills
    ├── feature-complete/
    │   └── SKILL.md
    └── code-review/
        └── SKILL.md
```

---

## Phase 3: Native Subagents

### 3.1 Convert to Native Subagent Format

**Goal**: Leverage Claude Code's built-in subagent spawning.

**Current**: Config entries that produce formatted prompts
**Target**: Native `.md` files that Claude spawns as separate processes

**Subagent Definition** (`.claude/agents/research.md`):
```yaml
---
name: research
description: Analyzes codebase, searches documentation, explores architecture
model: haiku
tools:
  - Glob
  - Grep
  - Read
---

You are the Research Agent. Your role is to thoroughly explore codebases and gather information.

## Your Responsibilities
- Search for relevant code patterns
- Read and analyze implementations
- Identify architectural patterns
- Document findings clearly

## Tools Available
- **Glob**: Find files by pattern
- **Grep**: Search content
- **Read**: Read file contents

## Output Format
Provide structured findings with file paths and line numbers.
```

**Model Tiering Strategy**:
| Agent Type | Model | Reasoning |
|------------|-------|-----------|
| Research | haiku | Fast exploration, simple analysis |
| Implementation | sonnet | Complex code generation |
| Debug | sonnet | Reasoning about bugs |
| Testing | haiku | Generate test cases |
| Security | sonnet | Security analysis needs depth |
| Performance | sonnet | Complex optimization |
| Documentation | haiku | Text generation |
| Market Analysis | sonnet | Complex business reasoning |

---

### 3.2 Orchestrator Refactoring

**Current**: JavaScript orchestrator routes queries to prompt templates.

**Target**: Lightweight coordinator that uses Claude's native Task tool.

**Before** (orchestrator.js):
```javascript
// 365 lines of custom routing logic
analyzeQuery(query) {
  // keyword matching
  // score calculation
  // workflow detection
}
```

**After** (simplified or removed):
```markdown
# .claude/skills/orchestrate/SKILL.md
---
name: orchestrate
description: Coordinates multi-agent workflows
---

When handling complex tasks, use the Task tool to spawn specialized agents:

1. **Research Phase**: Spawn research agent (haiku) to explore
2. **Implementation Phase**: Spawn implementation agent (sonnet) to build
3. **Quality Phase**: Spawn testing agent (haiku) to validate

Use parallel execution when agents don't depend on each other.
```

Claude Code's native Task tool handles the actual spawning:
```
Use the Task tool with subagent_type to spawn agents
```

---

## Phase 4: API & Database

### 4.1 REST API Design

**Endpoints**:
```
POST /api/sessions              # Start new agent session
GET  /api/sessions/:id          # Get session results
GET  /api/sessions              # List all sessions
POST /api/sessions/:id/execute  # Execute agent task
GET  /api/agents                # List available agents
GET  /api/workflows             # List workflows
```

**Technology Options**:
- Express.js (simple, familiar)
- Fastify (performance)
- Hono (modern, edge-ready)

### 4.2 Database Schema

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
  query TEXT,
  status VARCHAR(20),
  agents_used JSONB,
  workflow VARCHAR(50)
);

CREATE TABLE results (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  agent_name VARCHAR(50),
  output TEXT,
  model_used VARCHAR(20),
  tokens_used INTEGER,
  created_at TIMESTAMP
);
```

**Database Options**:
- SQLite (simple, file-based)
- PostgreSQL (production-ready)
- Turso/LibSQL (edge SQLite)

---

## Phase 5: Web Dashboard

### 5.1 Features

- Session history list
- Agent execution visualization
- Workflow progress tracking
- Results browser
- Configuration editor

### 5.2 Technology Stack

**Recommended**:
- **Framework**: Next.js or Astro (SSR/SSG)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js or Recharts
- **State**: React Query or SWR

**Simple Alternative**:
- Static HTML + vanilla JS
- Fetch from API
- Minimal dependencies

---

## Implementation Timeline

### Immediate (Week 1)
- [ ] Create `.claude/` directory structure
- [ ] Add `CLAUDE.md`
- [ ] Convert 3 highest-priority agents to Skills

### Short-term (Weeks 2-3)
- [ ] Complete Skills migration (all 15 agents)
- [ ] Create native subagent definitions
- [ ] Test model tiering

### Medium-term (Weeks 4-6)
- [ ] Build REST API skeleton
- [ ] Add database persistence
- [ ] Create basic web dashboard

### Long-term (Ongoing)
- [ ] Optimize workflows based on usage
- [ ] Add more sophisticated routing
- [ ] Integrate with external services

---

## Migration Checklist

### Phase 1: Foundation
- [ ] Create `.claude/` directory
- [ ] Migrate `settings.json`
- [ ] Create `CLAUDE.md`
- [ ] Update `.gitignore`

### Phase 2: Skills
- [ ] Create `.claude/skills/` structure
- [ ] Convert `research.txt` → `research/SKILL.md`
- [ ] Convert `implementation.txt` → `implementation/SKILL.md`
- [ ] Convert `debug.txt` → `debug/SKILL.md`
- [ ] Convert `testing.txt` → `testing/SKILL.md`
- [ ] Convert `security.txt` → `security/SKILL.md`
- [ ] Convert `performance.txt` → `performance/SKILL.md`
- [ ] Convert `documentation.txt` → `documentation/SKILL.md`
- [ ] Convert remaining agents (8 more)
- [ ] Test Skills auto-discovery

### Phase 3: Subagents
- [ ] Create `.claude/agents/` structure
- [ ] Define subagent .md files with model selection
- [ ] Test parallel execution
- [ ] Verify model tiering works

### Phase 4: API
- [ ] Choose API framework
- [ ] Implement endpoints
- [ ] Choose database
- [ ] Implement persistence
- [ ] Test API

### Phase 5: Dashboard
- [ ] Choose frontend stack
- [ ] Build session list view
- [ ] Build results viewer
- [ ] Deploy

---

## Rollback Plan

If migration causes issues:

1. **Keep `.claudecode/` intact** during migration
2. **Hooks still work** - original system remains functional
3. **Gradual cutover** - test Skills before removing hooks
4. **Git branches** - use feature branches for each phase

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Agents as Skills | 0/15 | 15/15 |
| Native subagents | 0 | Full coverage |
| Model tiering | No | Yes |
| API endpoints | 0 | 5+ |
| Database persistence | No | Yes |
| Web dashboard | No | Yes |
| Token cost reduction | Baseline | -40% |
| Execution speed | Baseline | +50% |

---

*Last Updated: January 2026*
