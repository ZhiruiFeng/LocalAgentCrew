#!/usr/bin/env node

/**
 * ANSI Color utilities for terminal output
 */

const colors = {
  // Reset
  reset: '\x1b[0m',

  // Text colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Bright colors
  brightBlack: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',

  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',

  // Styles
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  blink: '\x1b[5m',
  inverse: '\x1b[7m',
};

// Agent-specific color schemes
const agentColors = {
  research: {
    primary: colors.cyan,
    icon: '🔍',
    header: colors.cyan + colors.bold
  },
  implementation: {
    primary: colors.green,
    icon: '🛠️',
    header: colors.green + colors.bold
  },
  testing: {
    primary: colors.yellow,
    icon: '🧪',
    header: colors.yellow + colors.bold
  },
  debug: {
    primary: colors.red,
    icon: '🐛',
    header: colors.red + colors.bold
  },
  documentation: {
    primary: colors.blue,
    icon: '📝',
    header: colors.blue + colors.bold
  },
  performance: {
    primary: colors.magenta,
    icon: '⚡',
    header: colors.magenta + colors.bold
  },
  security: {
    primary: colors.brightRed,
    icon: '🔒',
    header: colors.brightRed + colors.bold
  }
};

/**
 * Colorize text with ANSI codes
 */
function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

/**
 * Create a colored header for an agent
 */
function agentHeader(agentName, title = '') {
  const scheme = agentColors[agentName] || {
    primary: colors.white,
    icon: '🤖',
    header: colors.white + colors.bold
  };

  const displayTitle = title || agentName.toUpperCase();
  const line = '═'.repeat(displayTitle.length + 10);

  return `
${colorize(line, scheme.primary)}
${colorize(`${scheme.icon}  ${displayTitle}  ${scheme.icon}`, scheme.header)}
${colorize(line, scheme.primary)}`;
}

/**
 * Create a section header
 */
function sectionHeader(text, agentName) {
  const scheme = agentColors[agentName] || { primary: colors.white };
  return colorize(`\n▸ ${text}`, scheme.primary + colors.bold);
}

/**
 * Create a colored bullet point
 */
function bullet(text, agentName) {
  const scheme = agentColors[agentName] || { primary: colors.white };
  return colorize(`  • ${text}`, scheme.primary);
}

/**
 * Create a colored box around text
 */
function box(text, agentName) {
  const scheme = agentColors[agentName] || { primary: colors.white };
  const lines = text.split('\n');
  const maxLength = Math.max(...lines.map(l => l.length));
  const topBottom = '─'.repeat(maxLength + 2);

  let result = colorize(`┌${topBottom}┐`, scheme.primary) + '\n';
  for (const line of lines) {
    const padding = ' '.repeat(maxLength - line.length);
    result += colorize(`│ ${line}${padding} │`, scheme.primary) + '\n';
  }
  result += colorize(`└${topBottom}┘`, scheme.primary);

  return result;
}

/**
 * Format agent instructions with colors
 */
function formatAgentInstructions(agentName, description, prompt) {
  const scheme = agentColors[agentName] || { primary: colors.white };

  let output = agentHeader(agentName, `${agentName.toUpperCase()} AGENT`);
  output += '\n\n';
  output += colorize(`Description: ${description}`, scheme.primary);
  output += '\n\n';
  output += sectionHeader('Instructions', agentName);
  output += '\n';
  output += colorize(prompt, colors.brightBlack);
  output += '\n';

  return output;
}

/**
 * Format workflow stage with colors
 */
function formatWorkflowStage(stageName, agents, parallel) {
  const stageColor = parallel ? colors.brightYellow : colors.brightCyan;
  const mode = parallel ? '⚡ PARALLEL' : '➜ SEQUENTIAL';

  let output = '\n' + colorize(`┏━━ ${stageName.toUpperCase()} ${mode}`, stageColor + colors.bold) + '\n';

  for (const agentName of agents) {
    const scheme = agentColors[agentName] || { icon: '🤖', primary: colors.white };
    output += colorize(`┃  ${scheme.icon} ${agentName}`, scheme.primary) + '\n';
  }

  output += colorize('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', stageColor);

  return output;
}

/**
 * Create a success message
 */
function success(text) {
  return colorize(`✓ ${text}`, colors.green + colors.bold);
}

/**
 * Create an error message
 */
function error(text) {
  return colorize(`✗ ${text}`, colors.red + colors.bold);
}

/**
 * Create a warning message
 */
function warning(text) {
  return colorize(`⚠ ${text}`, colors.yellow + colors.bold);
}

/**
 * Create an info message
 */
function info(text) {
  return colorize(`ℹ ${text}`, colors.blue + colors.bold);
}

module.exports = {
  colors,
  agentColors,
  colorize,
  agentHeader,
  sectionHeader,
  bullet,
  box,
  formatAgentInstructions,
  formatWorkflowStage,
  success,
  error,
  warning,
  info
};
