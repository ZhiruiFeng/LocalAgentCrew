#!/usr/bin/env node

/**
 * Agent Orchestrator for LocalAgentCrew
 * Routes user queries to appropriate specialized agents
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

class AgentOrchestrator {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('Failed to load agent configuration:', error.message);
      process.exit(1);
    }
  }

  /**
   * Analyzes user query and determines which agents should handle it
   */
  analyzeQuery(query) {
    const lowerQuery = query.toLowerCase();
    const matchedAgents = [];

    // Check each agent's triggers
    for (const [agentName, agentConfig] of Object.entries(this.config.agents)) {
      const score = this.calculateAgentScore(lowerQuery, agentConfig);
      if (score > 0) {
        matchedAgents.push({
          name: agentName,
          config: agentConfig,
          score: score
        });
      }
    }

    // Sort by priority and score
    matchedAgents.sort((a, b) => {
      if (a.config.priority !== b.config.priority) {
        return a.config.priority - b.config.priority;
      }
      return b.score - a.score;
    });

    return matchedAgents;
  }

  /**
   * Calculates relevance score for an agent based on trigger keywords
   */
  calculateAgentScore(query, agentConfig) {
    let score = 0;
    for (const trigger of agentConfig.triggers) {
      if (query.includes(trigger.toLowerCase())) {
        score += 10;
      }
    }
    return score;
  }

  /**
   * Checks if a workflow should be triggered
   */
  detectWorkflow(query) {
    const lowerQuery = query.toLowerCase();

    // Check for workflow keywords
    if (lowerQuery.includes('complete feature') ||
        (lowerQuery.includes('implement') && lowerQuery.includes('test'))) {
      return 'feature_complete';
    }

    if (lowerQuery.includes('bug') || lowerQuery.includes('fix')) {
      return 'bug_fix';
    }

    if (lowerQuery.includes('review') && lowerQuery.includes('code')) {
      return 'code_review';
    }

    return null;
  }

  /**
   * Generates routing plan for the query
   */
  route(query, context = {}) {
    const workflowName = this.detectWorkflow(query);

    if (workflowName && this.config.orchestration.enabled) {
      return this.routeToWorkflow(workflowName, query, context);
    }

    return this.routeToAgents(query, context);
  }

  /**
   * Routes query to a predefined workflow
   */
  routeToWorkflow(workflowName, query, context) {
    const workflow = this.config.workflows[workflowName];
    if (!workflow) {
      return this.routeToAgents(query, context);
    }

    return {
      type: 'workflow',
      workflow: workflowName,
      description: workflow.description,
      stages: workflow.stages || [],
      agents: workflow.agents.map(name => ({
        name,
        config: this.config.agents[name]
      })),
      execution_plan: this.generateExecutionPlan(workflow, query, context)
    };
  }

  /**
   * Routes query to individual agents
   */
  routeToAgents(query, context) {
    const matchedAgents = this.analyzeQuery(query);

    if (matchedAgents.length === 0) {
      // Fallback to research agent
      matchedAgents.push({
        name: this.config.routing.fallback_agent,
        config: this.config.agents[this.config.routing.fallback_agent],
        score: 1
      });
    }

    // Limit concurrent agents
    const selectedAgents = matchedAgents.slice(
      0,
      this.config.orchestration.max_concurrent_agents
    );

    return {
      type: 'agents',
      agents: selectedAgents,
      parallel: this.config.orchestration.parallel_execution && selectedAgents.length > 1,
      execution_plan: this.generateAgentExecutionPlan(selectedAgents, query, context)
    };
  }

  /**
   * Generates execution plan for workflow stages
   */
  generateExecutionPlan(workflow, query, context) {
    const plan = {
      stages: [],
      total_agents: 0
    };

    if (workflow.stages) {
      for (const stage of workflow.stages) {
        plan.stages.push({
          name: stage.name,
          agents: stage.agents,
          parallel: stage.parallel,
          tasks: stage.agents.map(agentName =>
            this.generateAgentTask(agentName, query, context, stage.name)
          )
        });
        plan.total_agents += stage.agents.length;
      }
    } else {
      // Simple sequential or parallel execution
      plan.stages.push({
        name: 'main',
        agents: workflow.agents,
        parallel: !workflow.sequential,
        tasks: workflow.agents.map(agentName =>
          this.generateAgentTask(agentName, query, context)
        )
      });
      plan.total_agents = workflow.agents.length;
    }

    return plan;
  }

  /**
   * Generates execution plan for individual agents
   */
  generateAgentExecutionPlan(agents, query, context) {
    return {
      tasks: agents.map(agent =>
        this.generateAgentTask(agent.name, query, context)
      )
    };
  }

  /**
   * Generates specific task instructions for an agent
   */
  generateAgentTask(agentName, query, context, stageName = '') {
    const agent = this.config.agents[agentName];
    const promptTemplate = this.loadPromptTemplate(agent.prompt_template);

    return {
      agent: agentName,
      type: agent.type,
      description: agent.description,
      prompt: this.fillPromptTemplate(promptTemplate, query, context, stageName),
      capabilities: agent.capabilities
    };
  }

  /**
   * Loads agent prompt template
   */
  loadPromptTemplate(templatePath) {
    try {
      const fullPath = path.join(__dirname, '..', templatePath);
      if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath, 'utf8');
      }
    } catch (error) {
      // Fall back to default template
    }
    return this.getDefaultPromptTemplate();
  }

  /**
   * Fills prompt template with context
   */
  fillPromptTemplate(template, query, context, stageName) {
    let prompt = template
      .replace(/\{query\}/g, query)
      .replace(/\{stage\}/g, stageName || 'main')
      .replace(/\{context\}/g, JSON.stringify(context, null, 2));

    return prompt;
  }

  /**
   * Default prompt template
   */
  getDefaultPromptTemplate() {
    return `You are a specialized agent working as part of a multi-agent system.

User Query: {query}

Context: {context}

Your task is to analyze this query from your specialized perspective and provide detailed findings. Focus on your area of expertise and provide actionable insights.

Please return your analysis in a structured format that can be easily integrated with other agents' findings.`;
  }

  /**
   * Main entry point - processes query and returns routing decision
   */
  process(query, context = {}) {
    if (!this.config.orchestration.enabled) {
      return {
        type: 'direct',
        message: 'Agent orchestration is disabled. Processing query directly.'
      };
    }

    const routingDecision = this.route(query, context);

    return {
      orchestration_enabled: true,
      routing_decision: routingDecision,
      query: query,
      timestamp: new Date().toISOString()
    };
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: orchestrator.js <query> [context_json]');
    process.exit(1);
  }

  const query = args[0];
  const context = args[1] ? JSON.parse(args[1]) : {};

  const orchestrator = new AgentOrchestrator();
  const result = orchestrator.process(query, context);

  console.log(JSON.stringify(result, null, 2));
}

module.exports = AgentOrchestrator;
