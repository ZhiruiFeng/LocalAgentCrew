<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 → 1.0.0
Bump rationale: MAJOR - Initial constitution establishment

Modified principles: N/A (initial creation)
Added sections:
  - Core Principles (5 principles)
  - Development Workflow
  - Quality Standards
  - Governance

Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ Constitution Check section compatible
  - .specify/templates/spec-template.md: ✅ Requirements structure compatible
  - .specify/templates/tasks-template.md: ✅ Phase structure compatible

Follow-up TODOs: None
-->

# LocalAgentCrew Constitution

## Core Principles

### I. Agent Specialization

Every agent MUST have a clearly defined domain of expertise with minimal overlap.

- Agents MUST be organized into coherent categories (Technical, Productivity, Business)
- Each agent MUST have explicit keyword triggers that map to its specialization
- Agents MUST NOT attempt tasks outside their defined scope; delegate to appropriate specialists
- New agents MUST justify their existence by demonstrating a gap not covered by existing agents

**Rationale**: Specialization ensures predictable routing, maintainable prompts, and clear ownership of capabilities. Overlap creates ambiguity in orchestration decisions.

### II. Model Tiering

The right model MUST be selected based on task complexity and cost-efficiency requirements.

- **Haiku**: MUST be used for fast, cost-effective tasks (research, testing, documentation, writing-assistant, task-planner, research-assistant)
- **Sonnet**: MUST be used for complex reasoning tasks (implementation, debug, security, performance, market-analyst)
- **Opus**: SHOULD be reserved for strategic planning and orchestration requiring maximum reasoning
- Model selection MUST be documented in agent definitions
- Cost vs. capability tradeoffs MUST be explicitly justified when deviating from tier guidelines

**Rationale**: Appropriate model selection optimizes both cost and response quality. Using Opus for simple tasks wastes resources; using Haiku for complex reasoning degrades output.

### III. Skills-First Interface

New functionality MUST be implemented using the modern Skills paradigm rather than legacy hook-based approaches.

- All agent capabilities MUST be exposed as Skills in `.claude/skills/`
- Legacy hook implementations in `.claudecode/` MUST NOT receive new features
- Skills MUST follow the standard SKILL.md format with YAML frontmatter
- Migration from hooks to Skills SHOULD be incremental and non-breaking
- Skills MUST be self-documenting with clear descriptions and usage examples

**Rationale**: Skills provide native Claude Code integration, auto-discovery, and a cleaner extensibility model. Continued investment in hooks creates technical debt.

### IV. Observability

All agent operations MUST produce traceable, debuggable output.

- Agents MUST use the defined ANSI color scheme for visual differentiation
- Usage tracking with `[USAGE]` prefix MUST create timestamped records in designated folders
- Error states MUST be clearly communicated with appropriate color coding (Red for errors, Yellow for warnings)
- Agent selection decisions SHOULD be logged when orchestration occurs
- Output artifacts MUST be stored in predictable locations (`questions/`, `interactions/`, `results/`)

**Rationale**: Debugging multi-agent systems requires visibility into routing decisions and execution traces. Color coding provides immediate visual feedback on agent context.

### V. Modular Migration

System modernization MUST proceed incrementally without breaking existing functionality.

- Legacy and modern systems MUST coexist during transition periods
- Each migration phase MUST be independently valuable and deployable
- Breaking changes MUST be documented in migration roadmaps before implementation
- Rollback paths SHOULD be maintained until new systems prove stable
- Migration progress MUST be tracked with clear phase completion criteria

**Rationale**: Big-bang migrations introduce risk and block progress. Incremental migration delivers value continuously while managing risk.

## Development Workflow

Development on LocalAgentCrew follows these practices:

- **Agent Development**: New agents require definition in both `.claude/agents/` (subagent) and `.claude/skills/` (skill)
- **Prompt Engineering**: Agent prompts MUST include role declaration, query placeholders, capabilities section, and output format
- **Testing**: Use `node .claudecode/agents/scripts/test-colors.js` for color scheme validation
- **Routing Validation**: Use `node .claudecode/agents/scripts/orchestrator.js "query"` to test agent routing
- **Documentation**: Update CLAUDE.md when adding new agents or modifying workflows

## Quality Standards

- Agent prompts MUST NOT contain hardcoded values that should be parameterized
- Color assignments MUST follow the scheme in `.claudecode/agents/COLOR_SCHEME.md`
- Workflow definitions MUST specify clear stage transitions and success criteria
- Configuration changes MUST be validated against the schema in `.claudecode/agents/config.json`

## Governance

This constitution establishes guidelines that encourage best practices while allowing justified exceptions.

**Amendment Process**:
1. Proposed changes MUST be documented with rationale
2. Changes affecting multiple principles require explicit review
3. Version increments follow semantic versioning (MAJOR.MINOR.PATCH)
4. Amendment date MUST be updated on any modification

**Compliance**:
- Teams SHOULD verify alignment with principles during code review
- Exceptions MUST be documented with justification in relevant files
- Periodic review of constitution relevance is encouraged

**Reference**: Use CLAUDE.md for runtime development guidance and conventions.

**Version**: 1.0.0 | **Ratified**: 2026-01-08 | **Last Amended**: 2026-01-08
