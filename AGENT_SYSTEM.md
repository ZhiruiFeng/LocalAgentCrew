# LocalAgentCrew - Multi-Agent System

A sophisticated multi-agent architecture for Claude Code that automatically coordinates specialized agents to handle complex development tasks.

## Architecture Overview

```
User Query → Hook Handler → Orchestrator → Agent Routing
                                              ↓
                          ┌──────────────────┴──────────────────┐
                          ↓                  ↓                  ↓
                    Research Agent   Implementation Agent   Testing Agent
                    Debug Agent      Documentation Agent    Security Agent
                    Performance Agent
                          ↓                  ↓                  ↓
                          └──────────────────┬──────────────────┘
                                             ↓
                                    Aggregated Response
```

## How It Works

### 1. User Prompt Interception
When you submit a query in Claude Code:
- The `user-prompt-submit-hook` intercepts your query
- Hook handler (`hook-handler.js`) analyzes the query
- Context is gathered (git branch, mentioned files, etc.)

### 2. Intelligent Routing
The orchestrator (`orchestrator.js`):
- Matches query against agent trigger keywords
- Calculates relevance scores for each agent
- Detects if a workflow should be activated
- Generates execution plan (parallel or sequential)

### 3. Agent Execution
Specialized agents execute based on the plan:
- Each agent receives a tailored prompt from templates
- Agents work autonomously using Claude Code tools
- Results are structured for easy integration

### 4. Response Aggregation
The main Claude instance:
- Receives orchestration instructions
- Coordinates agent execution
- Aggregates findings into coherent response

## Available Agents

Each agent has a unique color scheme in terminal output for easy identification and visual organization.

### 🔍 Research Agent (Cyan)
**Triggers**: `how does`, `what is`, `explain`, `analyze`, `find where`, `search for`, `investigate`

**Capabilities**:
- Code search and analysis
- Documentation lookup
- Dependency investigation
- Architecture exploration

**Use Cases**:
- "How does authentication work in this codebase?"
- "Find where user data is validated"
- "Analyze the database schema"

### 🛠️ Implementation Agent (Green)
**Triggers**: `implement`, `create`, `add feature`, `build`, `develop`, `write code`

**Capabilities**:
- Feature implementation
- Code refactoring
- Following project patterns

**Use Cases**:
- "Implement user profile editing"
- "Add pagination to the API"
- "Refactor the authentication module"

### 🧪 Testing Agent (Yellow)
**Triggers**: `test`, `unit test`, `coverage`, `e2e`, `integration test`

**Capabilities**:
- Test writing (unit, integration, e2e)
- Test execution
- Coverage analysis

**Use Cases**:
- "Write tests for the payment module"
- "Run all tests and fix failures"
- "Analyze test coverage"

### 🐛 Debug Agent (Red)
**Triggers**: `debug`, `fix bug`, `error`, `not working`, `broken`, `issue with`

**Capabilities**:
- Bug identification
- Root cause analysis
- Fix implementation

**Use Cases**:
- "Debug why login is failing"
- "Fix the TypeError in checkout"
- "Investigate memory leak"

### 📝 Documentation Agent (Blue)
**Triggers**: `document`, `add comments`, `write docs`, `readme`, `api docs`

**Capabilities**:
- Documentation creation
- Code commenting
- API documentation

**Use Cases**:
- "Document the API endpoints"
- "Add JSDoc comments to utils"
- "Update the README"

### ⚡ Performance Agent (Magenta)
**Triggers**: `optimize`, `performance`, `slow`, `speed up`, `bottleneck`, `profile`

**Capabilities**:
- Performance analysis
- Bottleneck identification
- Optimization suggestions

**Use Cases**:
- "Optimize the search query"
- "Find performance bottlenecks"
- "Speed up the dashboard load"

### 🔒 Security Agent (Bright Red)
**Triggers**: `security`, `vulnerability`, `secure`, `auth`, `sanitize`, `injection`

**Capabilities**:
- Security review
- Vulnerability detection
- Best practices enforcement

**Use Cases**:
- "Review authentication security"
- "Check for SQL injection vulnerabilities"
- "Audit API security"

## Predefined Workflows

### Feature Complete Workflow
**Trigger**: "implement complete feature", "build new feature"

**Stages**:
1. **Research & Planning** (Research Agent)
   - Analyzes codebase
   - Plans implementation approach

2. **Implementation** (Implementation Agent)
   - Writes the feature code
   - Integrates with existing code

3. **Quality Assurance** (Testing + Security Agents - Parallel)
   - Writes and runs tests
   - Security review

4. **Finalization** (Documentation Agent)
   - Adds documentation
   - Creates usage examples

### Bug Fix Workflow
**Trigger**: "fix bug", "debug issue", "resolve error"

**Stages**:
1. **Diagnosis** (Debug Agent)
   - Identifies root cause
   - Proposes fix

2. **Verification** (Testing Agent)
   - Tests the fix
   - Ensures no regressions

### Code Review Workflow
**Trigger**: "review code", "code review"

**Stages**:
1. **Comprehensive Review** (Security + Performance + Testing Agents - Parallel)
   - Security analysis
   - Performance review
   - Test coverage check

2. **Documentation Review** (Documentation Agent)
   - Checks documentation completeness

## Configuration

### Main Configuration
**File**: `.claudecode/agents/config.json`

Key settings:
```json
{
  "orchestration": {
    "enabled": true,
    "mode": "auto",
    "parallel_execution": true,
    "max_concurrent_agents": 3
  }
}
```

### Agent Customization
Each agent can be customized with:
- **triggers**: Keywords that activate the agent
- **priority**: Execution priority (1 = highest)
- **capabilities**: What the agent can do
- **prompt_template**: Custom instructions
- **dependencies**: Other agents it depends on
- **auto_trigger_after**: Auto-activate after certain agents

### Creating Custom Workflows
Add workflow definitions to `.claudecode/agents/workflows/`:

```json
{
  "name": "my_workflow",
  "description": "Custom workflow description",
  "stages": [
    {
      "name": "stage_1",
      "agents": ["research"],
      "parallel": false
    }
  ],
  "triggers": ["keyword to activate"]
}
```

## Usage Examples

### Single Agent Tasks
```
You: "Find all API endpoints in the codebase"
→ Research Agent activates
→ Uses Grep/Glob to search code
→ Returns structured findings
```

### Multi-Agent Tasks
```
You: "Implement user authentication and test it"
→ Implementation Agent: Writes auth code
→ Testing Agent: Creates tests (parallel if enabled)
→ Both results aggregated
```

### Workflow Tasks
```
You: "Implement complete login feature"
→ Feature Complete Workflow activates
→ Research → Implementation → Testing+Security → Documentation
→ Comprehensive delivery
```

## Usage Tracking

The system includes automatic usage tracking for queries prefixed with `[USAGE]`. This feature helps you maintain a record of important interactions and their outputs.

### How It Works

When you prefix your query with `[USAGE]`:

1. **Timestamp Generation**: A unique timestamp is created (format: `YYYY-MM-DD_HH-mm-ss`)
2. **Prompt Storage**: Your question (without the `[USAGE]` prefix) is saved to `questions/[timestamp].txt`
3. **Interaction Log**: A conversation log is initialized at `interactions/[timestamp].md`
4. **Results Folder**: A dedicated subfolder is created at `results/[timestamp]/` for any generated artifacts

### Example Usage

```
You: "[USAGE] Implement user authentication with OAuth2"
→ 📊 Usage Tracking Session: 2025-10-02_14-30-45
→    📝 Prompt stored: questions/2025-10-02_14-30-45.txt
→    💬 Interaction log: interactions/2025-10-02_14-30-45.md
→    📁 Results folder: results/2025-10-02_14-30-45/

[Normal agent orchestration proceeds...]
[Any generated docs/images are saved to the results folder]
```

### Configuration

Usage tracking is configured in `.claudecode/agents/config.json`:

```json
{
  "usage_tracking": {
    "enabled": true,
    "trigger_prefix": "[USAGE]",
    "storage": {
      "questions_dir": "questions",
      "interactions_dir": "interactions",
      "results_dir": "results"
    },
    "timestamp_format": "YYYY-MM-DD_HH-mm-ss",
    "features": {
      "store_prompt": true,
      "store_interactions": true,
      "store_results": true,
      "auto_create_result_subfolder": true
    }
  }
}
```

### Use Cases

- **Documentation**: Track how you implemented specific features
- **Learning**: Keep a record of complex problem-solving sessions
- **Auditing**: Maintain logs of important development decisions
- **Sharing**: Easily share your interaction history and results with team members

## File Structure

```
.claudecode/
├── settings.json                 # Claude Code settings with hooks
└── agents/
    ├── config.json              # Main agent configuration
    ├── README.md                # Quick reference guide
    ├── prompts/                 # Agent prompt templates (with color hints)
    │   ├── research.txt
    │   ├── implementation.txt
    │   ├── testing.txt
    │   ├── debug.txt
    │   ├── documentation.txt
    │   ├── performance.txt
    │   └── security.txt
    ├── workflows/               # Workflow definitions
    │   ├── feature-complete.json
    │   ├── bug-fix.json
    │   └── code-review.json
    └── scripts/                 # Core scripts
        ├── orchestrator.js      # Main routing logic
        ├── hook-handler.js      # Hook integration with colored output
        ├── usage-tracker.js     # Usage tracking for [USAGE] prompts
        ├── colors.js            # ANSI color utilities
        └── test-colors.js       # Color scheme preview tool

questions/                       # Stored prompts (when using [USAGE] prefix)
interactions/                    # Conversation logs (when using [USAGE] prefix)
results/                         # Generated artifacts organized by timestamp
    └── [timestamp]/             # Subfolder for each [USAGE] session
```

## Extending the System

### Add a New Agent

1. **Update config.json**:
```json
{
  "agents": {
    "my_agent": {
      "type": "general-purpose",
      "description": "What this agent does",
      "triggers": ["keyword1", "keyword2"],
      "capabilities": ["capability1", "capability2"],
      "prompt_template": "prompts/my_agent.txt",
      "priority": 2
    }
  }
}
```

2. **Create prompt template**: `.claudecode/agents/prompts/my_agent.txt`

3. **Test**: Submit a query with trigger keywords

### Modify Orchestration Logic

Edit `.claudecode/agents/scripts/orchestrator.js`:
- Adjust `calculateAgentScore()` for different matching logic
- Modify `detectWorkflow()` for custom workflow triggers
- Update routing strategy in the `route()` method

### Disable Orchestration

In `.claudecode/agents/config.json`:
```json
{
  "orchestration": {
    "enabled": false
  }
}
```

Or remove the hook from `.claudecode/settings.json`.

## Visual Design

### Color Coding

The agent system uses ANSI color codes to make terminal output more readable and organized:

- **🔍 Research**: Cyan - For exploration and analysis
- **🛠️ Implementation**: Green - For successful code creation
- **🧪 Testing**: Yellow - For test-related activities
- **🐛 Debug**: Red - For error identification and fixes
- **📝 Documentation**: Blue - For documentation tasks
- **⚡ Performance**: Magenta - For optimization work
- **🔒 Security**: Bright Red - For security reviews

### Preview Colors

Run this command to see all color schemes:
```bash
node .claudecode/agents/scripts/test-colors.js
```

### Color Utilities

The color system is provided by `.claudecode/agents/scripts/colors.js` and includes:
- Agent-specific color schemes
- Formatted headers and sections
- Workflow stage formatting
- Status messages (success, error, warning, info)

## Best Practices

1. **Start Broad**: Let the orchestrator route your query first
2. **Use Workflows**: For complex tasks, trigger workflows explicitly
3. **Review Agent Output**: Agents provide structured findings for transparency - look for color-coded sections
4. **Iterate**: Refine queries based on agent responses
5. **Customize Triggers**: Add project-specific keywords to agent triggers
6. **Monitor Performance**: Adjust `max_concurrent_agents` based on system performance
7. **Visual Scanning**: Use the color-coded output to quickly identify which agent is responding

## Troubleshooting

### Agents Not Activating
- Check `.claudecode/settings.json` has the hook configured
- Verify `orchestration.enabled: true` in `config.json`
- Ensure query contains agent trigger keywords

### Hook Errors
- Check Node.js is installed: `node --version`
- Verify script permissions: `chmod +x .claudecode/agents/scripts/*.js`
- Review error messages in Claude Code output

### Unwanted Orchestration
- Adjust trigger keywords in `config.json`
- Modify `shouldOrchestrate()` in `hook-handler.js`
- Temporarily disable with `orchestration.enabled: false`

## Advanced Configuration

### Parallel vs Sequential Execution
```json
{
  "orchestration": {
    "parallel_execution": true,  // Run multiple agents concurrently
    "max_concurrent_agents": 3   // Limit concurrent agents
  }
}
```

### Context-Aware Routing
```json
{
  "routing": {
    "context_analysis": {
      "enabled": true,
      "use_file_context": true,   // Consider mentioned files
      "use_git_context": true     // Consider git branch/status
    }
  }
}
```

### Agent Dependencies
```json
{
  "agents": {
    "implementation": {
      "dependencies": ["research"],      // Must run after research
      "auto_trigger_after": ["testing"]  // Auto-run after testing
    }
  }
}
```

## Contributing

To improve the agent system:
1. Add new agent types for specialized tasks
2. Create workflow templates for common patterns
3. Enhance routing logic with ML-based matching
4. Add agent result caching for efficiency

## License

Part of the LocalAgentCrew project.
