#!/usr/bin/env node

/**
 * Usage Tracker Module
 * Tracks prompts, interactions, and results for [USAGE] prefixed queries
 */

const fs = require('fs');
const path = require('path');

class UsageTracker {
  constructor(config, workingDir) {
    this.config = config.usage_tracking || {};
    this.workingDir = workingDir;
    this.enabled = this.config.enabled || false;
    this.triggerPrefix = this.config.trigger_prefix || '[USAGE]';

    this.storage = this.config.storage || {
      questions_dir: 'questions',
      interactions_dir: 'interactions',
      results_dir: 'results'
    };

    this.features = this.config.features || {
      store_prompt: true,
      store_interactions: true,
      store_results: true,
      auto_create_result_subfolder: true
    };
  }

  /**
   * Check if prompt should trigger usage tracking
   */
  shouldTrack(prompt) {
    if (!this.enabled) return false;
    return prompt.trim().startsWith(this.triggerPrefix);
  }

  /**
   * Generate timestamp in configured format
   */
  generateTimestamp() {
    const now = new Date();
    const format = this.config.timestamp_format || 'YYYY-MM-DD_HH-mm-ss';

    // Simple timestamp format implementation
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * Ensure directory exists
   */
  ensureDirectory(dirPath) {
    const fullPath = path.join(this.workingDir, dirPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    return fullPath;
  }

  /**
   * Store the original prompt
   */
  storePrompt(prompt, timestamp) {
    if (!this.features.store_prompt) return null;

    const questionsDir = this.ensureDirectory(this.storage.questions_dir);
    const filename = `${timestamp}.txt`;
    const filepath = path.join(questionsDir, filename);

    // Remove the [USAGE] prefix before storing
    const cleanPrompt = prompt.replace(this.triggerPrefix, '').trim();

    fs.writeFileSync(filepath, cleanPrompt, 'utf8');
    return filepath;
  }

  /**
   * Initialize interaction log
   */
  initializeInteractionLog(prompt, timestamp) {
    if (!this.features.store_interactions) return null;

    const interactionsDir = this.ensureDirectory(this.storage.interactions_dir);
    const filename = `${timestamp}.md`;
    const filepath = path.join(interactionsDir, filename);

    const initialContent = `# Interaction Log - ${timestamp}\n\n## User Prompt\n\n${prompt.replace(this.triggerPrefix, '').trim()}\n\n## Conversation\n\n`;

    fs.writeFileSync(filepath, initialContent, 'utf8');
    return filepath;
  }

  /**
   * Append to interaction log
   */
  appendToInteractionLog(timestamp, content, role = 'assistant') {
    if (!this.features.store_interactions) return;

    const interactionsDir = path.join(this.workingDir, this.storage.interactions_dir);
    const filename = `${timestamp}.md`;
    const filepath = path.join(interactionsDir, filename);

    if (!fs.existsSync(filepath)) return;

    const entry = `\n### ${role === 'user' ? 'User' : 'Assistant'} (${new Date().toISOString()})\n\n${content}\n\n`;
    fs.appendFileSync(filepath, entry, 'utf8');
  }

  /**
   * Create results subfolder
   */
  createResultsSubfolder(timestamp) {
    if (!this.features.auto_create_result_subfolder) return null;

    const resultsDir = this.ensureDirectory(this.storage.results_dir);
    const subfolderPath = path.join(resultsDir, timestamp);

    if (!fs.existsSync(subfolderPath)) {
      fs.mkdirSync(subfolderPath, { recursive: true });

      // Create a README in the results subfolder
      const readmePath = path.join(subfolderPath, 'README.md');
      const readmeContent = `# Results for ${timestamp}\n\nThis folder contains all generated artifacts (documents, images, etc.) from the interaction.\n`;
      fs.writeFileSync(readmePath, readmeContent, 'utf8');
    }

    return subfolderPath;
  }

  /**
   * Initialize tracking session
   */
  initializeSession(prompt) {
    const timestamp = this.generateTimestamp();

    const session = {
      timestamp,
      prompt: prompt,
      paths: {}
    };

    // Store prompt
    const promptPath = this.storePrompt(prompt, timestamp);
    if (promptPath) {
      session.paths.prompt = promptPath;
    }

    // Initialize interaction log
    const interactionPath = this.initializeInteractionLog(prompt, timestamp);
    if (interactionPath) {
      session.paths.interaction = interactionPath;
    }

    // Create results subfolder
    const resultsPath = this.createResultsSubfolder(timestamp);
    if (resultsPath) {
      session.paths.results = resultsPath;
    }

    return session;
  }

  /**
   * Get session info message for user
   */
  getSessionInfoMessage(session) {
    let message = `\n📊 Usage Tracking Session: ${session.timestamp}\n`;

    if (session.paths.prompt) {
      message += `   📝 Prompt stored: ${path.relative(this.workingDir, session.paths.prompt)}\n`;
    }

    if (session.paths.interaction) {
      message += `   💬 Interaction log: ${path.relative(this.workingDir, session.paths.interaction)}\n`;
    }

    if (session.paths.results) {
      message += `   📁 Results folder: ${path.relative(this.workingDir, session.paths.results)}\n`;
    }

    message += `\n`;
    return message;
  }
}

module.exports = UsageTracker;
