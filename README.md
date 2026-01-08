# LocalAgentCrew

A multi-agent orchestration framework for Claude Code that enables specialized AI agents to collaborate on complex tasks.

## Overview

LocalAgentCrew provides 15 specialized agents across three domains:
- **Technical Development**: Research, Implementation, Debug, Testing, Security, Performance, Documentation
- **Productivity**: Writing Assistant, Task Management, Research Assistant
- **Business Analysis**: Market Researcher, Competitor Analyst, Customer Insights, Trend Forecaster, SWOT Analyst

## Architecture

```
User Query → Hook Interception → Orchestrator → Agent Selection → Claude Execution
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
              Single Agent      Multi-Agent        Workflow
                                (parallel)       (multi-stage)
```

The system uses a hook-based architecture that intercepts user prompts, analyzes them against agent triggers, and routes to the appropriate specialized agent(s).

## Quick Start

1. Clone this repository
2. The `.claudecode/settings.json` hooks are automatically detected by Claude Code
3. Start asking questions - the orchestrator handles routing

**Example queries**:
```
"How does the authentication system work?"  → Research Agent
"Implement a new login feature"             → Implementation Agent
"Debug the checkout error"                  → Debug Agent
"Run a complete market analysis"            → Market Analysis Workflow
```

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | Detailed system architecture and components |
| [Gap Analysis](docs/GAP_ANALYSIS.md) | Comparison with latest Claude Code features |
| [Migration Roadmap](docs/MIGRATION_ROADMAP.md) | Plan to modernize the system |
| [Claude Code Evolution](docs/CLAUDE_CODE_EVOLUTION.md) | Research on recent Claude Code changes |
| [Agent System](AGENT_SYSTEM.md) | Comprehensive agent documentation |

## Project Status

### Current Implementation
- ✅ 15 specialized agents with keyword triggers
- ✅ 6 predefined workflows (feature-complete, bug-fix, code-review, market analysis)
- ✅ Parallel and sequential execution modes
- ✅ Context-aware routing (git, files)
- ✅ ANSI color-coded output
- ✅ Usage tracking with `[USAGE]` prefix

### Planned Enhancements
- 🔄 Migration to Claude Code Skills system
- 🔄 Native subagent support with model tiering
- 🔄 REST API for results
- 🔄 Web dashboard for visualization
- 🔄 Database persistence

## Directory Structure

```
LocalAgentCrew/
├── .claudecode/               # Claude Code configuration
│   ├── settings.json          # Hook configuration
│   └── agents/
│       ├── config.json        # Agent & workflow definitions
│       ├── prompts/           # 15 agent prompt templates
│       ├── scripts/           # Orchestration engine (JS)
│       └── workflows/         # 6 workflow definitions
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md
│   ├── GAP_ANALYSIS.md
│   ├── MIGRATION_ROADMAP.md
│   └── CLAUDE_CODE_EVOLUTION.md
├── AGENT_SYSTEM.md            # Detailed agent documentation
└── README.md
```

## Agent Categories

### Technical Agents

| Agent | Triggers | Color |
|-------|----------|-------|
| Research | how does, what is, explain, analyze | Cyan |
| Implementation | implement, create, add feature | Green |
| Debug | debug, fix bug, error | Red |
| Testing | test, unit test, coverage | Yellow |
| Security | security, vulnerability, auth | Bright Red |
| Performance | optimize, performance, slow | Magenta |
| Documentation | document, write docs, readme | Blue |

### Productivity Agents

| Agent | Triggers | Color |
|-------|----------|-------|
| Writing Assistant | write email, draft, compose | Purple |
| Task Management | organize tasks, create plan | Orange |
| Research Assistant | research, summarize, compare | Teal |

### Business Agents

| Agent | Triggers | Color |
|-------|----------|-------|
| Market Researcher | market research, market size | Bright Cyan |
| Competitor Analyst | competitor analysis, benchmark | Bright Yellow |
| Customer Insights | customer analysis, buyer persona | Bright Magenta |
| Trend Forecaster | forecast, predict, trends | Bright Green |
| SWOT Analyst | swot analysis, strategic analysis | Bright Blue |

## Workflows

| Workflow | Stages | Use Case |
|----------|--------|----------|
| Feature Complete | research → implementation → QA → finalization | Full feature development |
| Bug Fix | debug → testing | Debug and validate |
| Code Review | security + performance + testing → documentation | Comprehensive review |
| Market Analysis | research → intelligence → strategic | Complete market assessment |

## Configuration

### Hook Configuration (`.claudecode/settings.json`)
```json
{
  "hooks": {
    "userPromptSubmit": "node .claudecode/agents/scripts/hook-handler.js"
  },
  "agents": {
    "enabled": true,
    "orchestrationMode": "auto"
  }
}
```

### Key Settings (`.claudecode/agents/config.json`)
- `orchestration.max_concurrent_agents`: Max parallel agents (default: 3)
- `routing.fallback_agent`: Default when no match (research)
- `routing.multi_agent_threshold`: Min score for multi-agent

## Usage Tracking

Prefix your query with `[USAGE]` to enable session tracking:
```
[USAGE] Analyze the payment system architecture
```

Creates timestamped folders:
- `questions/` - Stored prompts
- `interactions/` - Conversation logs
- `results/` - Output artifacts

## Future Vision

This project aims to become a comprehensive platform for:
1. **Multi-agent collaboration** - Specialized agents working together
2. **Result visualization** - Web dashboard for viewing outputs
3. **Data persistence** - API and database integration
4. **Enterprise integration** - Sync results to external systems

See [Migration Roadmap](docs/MIGRATION_ROADMAP.md) for detailed plans.

## Recent Changes

The Claude Code ecosystem has evolved significantly since this project was started. Key updates include:
- **Skills** (Dec 2025) - New extensibility paradigm replacing slash commands
- **Native Subagents** - Built-in multi-agent support
- **Model Tiering** - Use Opus/Sonnet/Haiku for different tasks
- **Claude Haiku 4.5** (Oct 2025) - 90% capability at 3x cost savings

See [Gap Analysis](docs/GAP_ANALYSIS.md) for detailed comparison.

## Contributing

This is a personal project for local agent crews. Feel free to fork and adapt for your own use.

## License

See [LICENSE](LICENSE) file.

---

*Last updated: January 2026*
