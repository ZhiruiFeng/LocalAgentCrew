# Agent Color Scheme Guide

## Overview

The LocalAgentCrew multi-agent system uses ANSI terminal colors to visually distinguish between different agents and their outputs. This makes it easy to scan responses and understand which agent is providing information.

## Color Assignments

| Agent | Color | ANSI Code | Visual Theme |
|-------|-------|-----------|--------------|
| 🔍 Research | Cyan | `\x1b[36m` | Exploration, investigation |
| 🛠️ Implementation | Green | `\x1b[32m` | Success, creation |
| 🧪 Testing | Yellow | `\x1b[33m` | Caution, validation |
| 🐛 Debug | Red | `\x1b[31m` | Errors, problems |
| 📝 Documentation | Blue | `\x1b[34m` | Information, clarity |
| ⚡ Performance | Magenta | `\x1b[35m` | Speed, optimization |
| 🔒 Security | Bright Red | `\x1b[91m` | Critical, security |

## Color Utilities

### Available Functions

From `colors.js`:

```javascript
// Basic colorization
colorize(text, color)

// Agent headers
agentHeader(agentName, title)

// Section headers
sectionHeader(text, agentName)

// Workflow stages
formatWorkflowStage(stageName, agents, parallel)

// Status messages
success(text)    // Green ✓
error(text)      // Red ✗
warning(text)    // Yellow ⚠
info(text)       // Blue ℹ
```

### Example Usage

```javascript
const { agentHeader, colorize, colors } = require('./colors.js');

// Create a colored header for research agent
console.log(agentHeader('research'));

// Colorize custom text
console.log(colorize('This is cyan text', colors.cyan));
```

## Output Format Examples

### Research Agent Output
```
═══════════════════════
🔍  RESEARCH  🔍
═══════════════════════

▸ Relevant Files
  • src/auth.js - Authentication logic
  • src/user.js - User management
```

### Implementation Agent Output
```
══════════════════════════
🛠️  IMPLEMENTATION  🛠️
══════════════════════════

▸ Changes Made
  ✅ Created new authentication module
  ✅ Updated user model
```

### Workflow Stage Output
```
┏━━ QUALITY_ASSURANCE ⚡ PARALLEL
┃  🧪 testing
┃  🔒 security
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Testing the Color Scheme

Run the color preview script:

```bash
node .claudecode/agents/scripts/test-colors.js
```

This will display:
- All agent color schemes
- Sample headers and sections
- Workflow stage formatting
- Status message examples

## Customizing Colors

To modify agent colors, edit `.claudecode/agents/scripts/colors.js`:

```javascript
const agentColors = {
  research: {
    primary: colors.cyan,        // Main color
    icon: '🔍',                  // Agent icon
    header: colors.cyan + colors.bold  // Header style
  },
  // ... other agents
};
```

## Color Theory

The chosen colors follow these principles:

1. **Research (Cyan)**: Cool, analytical color for investigation
2. **Implementation (Green)**: Positive, "go" signal for creation
3. **Testing (Yellow)**: Caution/attention for validation
4. **Debug (Red)**: Stop, error indication
5. **Documentation (Blue)**: Calm, informative
6. **Performance (Magenta)**: Energetic, different from others
7. **Security (Bright Red)**: Critical, high-priority attention

## Accessibility

The color scheme is designed to be:
- **Distinguishable**: Each color is visually distinct
- **Meaningful**: Colors match their semantic purpose
- **Terminal-friendly**: Works in most modern terminals
- **Scannable**: Easy to identify at a glance

Note: If colors don't display correctly, ensure your terminal supports ANSI color codes.

## Integration with Agent Prompts

Each agent prompt template includes color guidance:

```
OUTPUT FORMAT:
Use cyan color (🔍 Research Agent theme) for headers and key information.

## 🔍 Research Findings
...
```

This ensures agents structure their output with appropriate visual hierarchy and color cues.
