# LocalAgentCrew Project Guide

## Project Overview

LocalAgentCrew is a multi-agent orchestration framework for Claude Code. It provides 20+ specialized AI agents across technical development, productivity, business analysis, and investment analysis domains that collaborate on complex tasks.

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

### Investment (5 agents)
- **investment-data-collector**: Real-time/historical stock data from APIs (Finnhub, Alpha Vantage, FMP)
- **stock-screener**: Quantitative stock screening and filtering
- **company-analyst**: Deep fundamental and technical company analysis
- **portfolio-risk-analyst**: Portfolio risk assessment, VaR, stress testing
- **investment-report-generator**: Daily reports, alerts, and summaries

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

## Migration Status

- [x] Phase 1: Directory structure (.claude/) - COMPLETED
- [x] Phase 1: CLAUDE.md conventions - COMPLETED
- [x] Phase 2: Skills migration (15/15 skills) - COMPLETED
- [x] Phase 3: Native subagents (11 agents with model tiering) - COMPLETED
- [x] Phase 3.5: Investment agents group (5 agents, 5 skills) - COMPLETED
- [ ] Phase 4: API integration - PENDING
- [ ] Phase 5: Web dashboard - PENDING

### Current Subagent Model Tiering
| Model | Agents | Use Case |
|-------|--------|----------|
| Haiku | research, testing, documentation, writing-assistant, task-planner, research-assistant, investment-data-collector, stock-screener, investment-report-generator | Fast, cost-effective tasks |
| Sonnet | implementation, debug, security, performance, market-analyst, company-analyst, portfolio-risk-analyst | Complex reasoning tasks |

### Investment Agent Details
| Agent | Model | Purpose |
|-------|-------|---------|
| investment-data-collector | Haiku | Fetch data from Finnhub, Alpha Vantage, FMP APIs |
| stock-screener | Haiku | Filter stocks by value, growth, quality, momentum criteria |
| company-analyst | Sonnet | Deep fundamental/technical analysis, valuation |
| portfolio-risk-analyst | Sonnet | VaR, volatility, drawdown, stress testing |
| investment-report-generator | Haiku | Daily reports, market summaries, alerts |

### Investment Skills
| Skill | Trigger Examples |
|-------|------------------|
| investment-daily-report | "daily report", "morning briefing", "market summary" |
| stock-analyzer | "analyze AAPL", "company analysis", "research stock" |
| stock-picker | "find stocks", "value stocks", "stock screen" |
| portfolio-risk | "portfolio risk", "VaR analysis", "risk metrics" |
| market-data | "stock price", "get quote", "historical prices" |

## Key Files

| File | Purpose |
|------|---------|
| `.claude/settings.json` | Modern settings (Skills enabled) |
| `.claudecode/agents/config.json` | Agent definitions, workflows |
| `.claudecode/agents/scripts/orchestrator.js` | Routing logic |
| `.claudecode/agents/scripts/hook-handler.js` | Prompt interception |
| `docs/MIGRATION_ROADMAP.md` | Detailed upgrade plan |
| `docs/INVESTMENT_RESEARCH_SUMMARY.md` | Investment API research summary |
| `docs/INVESTMENT_SYSTEM_DESIGN.md` | Investment system architecture |
| `docs/API_QUICK_REFERENCE.txt` | Quick reference for stock APIs |

## Investment System Quick Start

### Supported APIs
1. **Finnhub** (Primary) - Real-time quotes, news, fundamentals - 60 calls/min free
2. **Alpha Vantage** (Historical) - OHLCV data, technical indicators - 5 calls/min free
3. **Financial Modeling Prep** (Fundamentals) - Financial statements, ratios - 250 calls/day free

### Example Usage
```
# Get a stock quote
"What's the price of AAPL?"

# Analyze a company
"Analyze Tesla stock for investment"

# Screen for stocks
"Find me undervalued quality stocks"

# Generate daily report
"Generate my daily investment report"

# Assess portfolio risk
"Analyze my portfolio risk"
```

### Investment Skills Workflow
```
User Request
    ↓
market-data (fetch quotes, prices)
    ↓
stock-picker (screen candidates) OR stock-analyzer (deep analysis)
    ↓
portfolio-risk (risk assessment)
    ↓
investment-daily-report (compile findings)
```
