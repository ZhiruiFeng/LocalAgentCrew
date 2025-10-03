# Agent System Quick Reference

## Quick Start

The agent system is **automatically active** when you use Claude Code in this project. Just ask questions naturally!

### Examples

```bash
# Research
"How does authentication work?"
"Find all API routes"

# Implementation
"Implement user registration"
"Add email validation"

# Testing
"Write tests for the auth module"
"Run all tests"

# Debug
"Fix the login bug"
"Debug why users can't checkout"

# Full Workflow
"Implement complete shopping cart feature"
"Fix bug in payment processing and test it"
```

## Agent Types

Each agent has a distinct color scheme for easy identification in terminal output:

| Agent | Triggers | Purpose | Color |
|-------|----------|---------|-------|
| 🔍 Research | `how`, `what`, `find`, `analyze` | Code exploration | Cyan |
| 🛠️ Implementation | `implement`, `create`, `build` | Write code | Green |
| 🧪 Testing | `test`, `coverage` | Write/run tests | Yellow |
| 🐛 Debug | `fix`, `debug`, `error` | Find and fix bugs | Red |
| 📝 Documentation | `document`, `readme` | Create docs | Blue |
| ⚡ Performance | `optimize`, `slow`, `speed up` | Performance tuning | Magenta |
| 🔒 Security | `security`, `vulnerability` | Security review | Bright Red |

## Workflows

### Feature Complete
```
"implement complete [feature]"
```
Runs: Research → Implementation → Testing+Security → Documentation

### Bug Fix
```
"fix bug in [component]"
```
Runs: Debug → Testing

### Code Review
```
"review code"
```
Runs: Security+Performance+Testing → Documentation

## Configuration Files

- **Main Config**: `.claudecode/agents/config.json`
- **Hooks**: `.claudecode/settings.json`
- **Prompts**: `.claudecode/agents/prompts/*.txt`
- **Workflows**: `.claudecode/agents/workflows/*.json`

## Testing the System

```bash
# Test orchestrator
node .claudecode/agents/scripts/orchestrator.js "implement user login"

# Test with context
node .claudecode/agents/scripts/orchestrator.js "debug error" '{"gitBranch":"main"}'
```

## Disabling

To disable agent orchestration:

1. Edit `.claudecode/agents/config.json`:
```json
{
  "orchestration": {
    "enabled": false
  }
}
```

Or remove the hook from `.claudecode/settings.json`.

## Customization

### Add Agent Trigger
Edit `.claudecode/agents/config.json`:
```json
{
  "agents": {
    "research": {
      "triggers": ["how does", "what is", "YOUR_KEYWORD"]
    }
  }
}
```

### Create Workflow
Add to `.claudecode/agents/workflows/my-workflow.json`:
```json
{
  "name": "my_workflow",
  "triggers": ["keyword"],
  "agents": ["research", "implementation"]
}
```

### Modify Agent Behavior
Edit prompt templates in `.claudecode/agents/prompts/`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Agents not activating | Check `orchestration.enabled: true` |
| Hook errors | Ensure Node.js installed: `node --version` |
| Wrong agents selected | Adjust trigger keywords in config |
| Too slow | Reduce `max_concurrent_agents` or disable parallel execution |

## Full Documentation

See [AGENT_SYSTEM.md](../../AGENT_SYSTEM.md) for complete documentation.
