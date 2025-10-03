#!/usr/bin/env node

/**
 * Hook Handler for Claude Code Integration
 * Intercepts user prompts and routes them through the agent orchestrator
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const {
  agentHeader,
  sectionHeader,
  formatAgentInstructions,
  formatWorkflowStage,
  colorize,
  colors,
  agentColors
} = require('./colors.js');
const UsageTracker = require('./usage-tracker.js');

const ORCHESTRATOR_PATH = path.join(__dirname, 'orchestrator.js');
const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

class HookHandler {
  constructor() {
    this.prompt = process.env.PROMPT || '';
    this.workingDir = process.env.PWD || process.cwd();
  }

  /**
   * Gathers context about the current environment
   */
  gatherContext() {
    const context = {
      workingDir: this.workingDir,
      timestamp: new Date().toISOString()
    };

    // Git context
    try {
      const gitBranch = execSync('git branch --show-current', {
        cwd: this.workingDir,
        encoding: 'utf8'
      }).trim();
      context.gitBranch = gitBranch;
    } catch (e) {
      // Not a git repo or git not available
    }

    // File context (if specific files are mentioned)
    const fileMatches = this.prompt.match(/[\w\-\.\/]+\.(js|ts|py|go|java|rb|php|rs|cpp|c|h|json|yaml|yml|md)/gi);
    if (fileMatches) {
      context.mentionedFiles = fileMatches;
    }

    return context;
  }

  /**
   * Determines if orchestration should be triggered
   */
  shouldOrchestrate() {
    // Skip orchestration for simple queries
    const skipPatterns = [
      /^(yes|no|ok|thanks|thank you)$/i,
      /^\/\w+/,  // Skip slash commands
    ];

    for (const pattern of skipPatterns) {
      if (pattern.test(this.prompt.trim())) {
        return false;
      }
    }

    // Check if prompt indicates multi-agent need
    const multiAgentIndicators = [
      'implement and test',
      'build feature',
      'complete',
      'review and',
      'analyze and',
      'debug and fix'
    ];

    for (const indicator of multiAgentIndicators) {
      if (this.prompt.toLowerCase().includes(indicator)) {
        return true;
      }
    }

    // For now, orchestrate all non-trivial queries
    return this.prompt.trim().split(' ').length > 3;
  }

  /**
   * Calls the orchestrator and gets routing decision
   */
  getRoutingDecision() {
    const context = this.gatherContext();

    try {
      const result = execSync(
        `node "${ORCHESTRATOR_PATH}" "${this.prompt}" '${JSON.stringify(context)}'`,
        {
          cwd: this.workingDir,
          encoding: 'utf8',
          maxBuffer: 1024 * 1024
        }
      );

      return JSON.parse(result);
    } catch (error) {
      console.error('Orchestrator error:', error.message);
      return null;
    }
  }

  /**
   * Formats the routing decision as a Claude-friendly prompt injection with colors
   */
  formatAgentInstructions(decision) {
    if (!decision || !decision.orchestration_enabled) {
      return null;
    }

    const routing = decision.routing_decision;
    let instructions = '\n\n' + colorize('═'.repeat(60), colors.brightBlue) + '\n';
    instructions += colorize('🎯 AGENT ORCHESTRATION ACTIVE', colors.brightBlue + colors.bold) + '\n';
    instructions += colorize('═'.repeat(60), colors.brightBlue) + '\n\n';

    if (routing.type === 'workflow') {
      instructions += colorize(`📋 WORKFLOW: ${routing.workflow.toUpperCase()}`, colors.brightYellow + colors.bold) + '\n';
      instructions += colorize(`   ${routing.description}`, colors.yellow) + '\n\n';

      instructions += colorize('EXECUTION STAGES:', colors.brightCyan + colors.bold) + '\n\n';

      for (const stage of routing.execution_plan.stages) {
        // Stage header
        instructions += formatWorkflowStage(stage.name, stage.agents, stage.parallel) + '\n';

        // Task details for each agent
        for (const task of stage.tasks) {
          const scheme = agentColors[task.agent] || { icon: '🤖', primary: colors.white };
          instructions += '\n' + agentHeader(task.agent) + '\n';
          instructions += colorize(`📌 Task: ${task.description}`, scheme.primary) + '\n';
          instructions += colorize(`⚙️  Capabilities: ${task.capabilities.join(', ')}`, colors.brightBlack) + '\n\n';
          instructions += colorize('Instructions:', colors.bold) + '\n';
          instructions += colorize(task.prompt, colors.brightBlack) + '\n';
          instructions += colorize('─'.repeat(60), scheme.primary) + '\n';
        }
      }
    } else if (routing.type === 'agents') {
      const mode = routing.parallel ? '⚡ PARALLEL EXECUTION' : '➜ SEQUENTIAL EXECUTION';
      instructions += colorize(mode, colors.brightYellow + colors.bold) + '\n\n';

      for (const task of routing.execution_plan.tasks) {
        const agentInfo = routing.agents.find(a => a.name === task.agent);
        const scheme = agentColors[task.agent] || { icon: '🤖', primary: colors.white };

        instructions += agentHeader(task.agent) + '\n';
        instructions += colorize(`📊 Relevance Score: ${agentInfo?.score || 'N/A'}`, scheme.primary) + '\n';
        instructions += colorize(`📌 Task: ${task.description}`, scheme.primary) + '\n';
        instructions += colorize(`⚙️  Capabilities: ${task.capabilities.join(', ')}`, colors.brightBlack) + '\n\n';
        instructions += colorize('Instructions:', colors.bold) + '\n';
        instructions += colorize(task.prompt, colors.brightBlack) + '\n';
        instructions += colorize('─'.repeat(60), scheme.primary) + '\n\n';
      }
    }

    instructions += '\n' + colorize('═'.repeat(60), colors.brightBlue) + '\n';
    instructions += colorize('END AGENT ORCHESTRATION', colors.brightBlue + colors.bold) + '\n';
    instructions += colorize('═'.repeat(60), colors.brightBlue) + '\n';

    return instructions;
  }

  /**
   * Main execution
   */
  run() {
    // Load configuration
    let config = {};
    try {
      config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (e) {
      // Config not available, continue without usage tracking
    }

    // Initialize usage tracker
    const tracker = new UsageTracker(config, this.workingDir);
    let usageSession = null;

    // Check for [USAGE] prefix and initialize tracking
    if (tracker.shouldTrack(this.prompt)) {
      usageSession = tracker.initializeSession(this.prompt);

      // Output session info to stderr so it doesn't interfere with prompt
      console.error(tracker.getSessionInfoMessage(usageSession));

      // Remove [USAGE] prefix from the prompt before processing
      this.prompt = this.prompt.replace(tracker.triggerPrefix, '').trim();
    }

    // Check if orchestration should happen
    if (!this.shouldOrchestrate()) {
      // Pass through unchanged
      console.log(this.prompt);
      return;
    }

    // Get routing decision
    const decision = this.getRoutingDecision();

    if (!decision) {
      // Fallback: pass through unchanged
      console.log(this.prompt);
      return;
    }

    // Format agent instructions
    const agentInstructions = this.formatAgentInstructions(decision);

    if (agentInstructions) {
      // Inject agent orchestration instructions
      let finalPrompt = this.prompt + agentInstructions;

      // If usage tracking is active, add instruction to save results to the designated folder
      if (usageSession && usageSession.paths.results) {
        const resultsInstruction = `\n\n[SYSTEM INSTRUCTION] Usage tracking is active. Save any generated documents, images, or other artifacts to: ${usageSession.paths.results}\n`;
        finalPrompt += resultsInstruction;
      }

      console.log(finalPrompt);
    } else {
      // Pass through unchanged
      console.log(this.prompt);
    }
  }
}

// Execute
const handler = new HookHandler();
handler.run();
