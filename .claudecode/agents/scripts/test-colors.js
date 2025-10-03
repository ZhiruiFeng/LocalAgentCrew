#!/usr/bin/env node

/**
 * Test script to preview colored agent output
 */

const {
  agentHeader,
  sectionHeader,
  formatWorkflowStage,
  colorize,
  colors,
  agentColors,
  success,
  error,
  warning,
  info
} = require('./colors.js');

console.log('\n' + colorize('═'.repeat(70), colors.brightBlue));
console.log(colorize('🎨 AGENT COLOR SCHEME PREVIEW', colors.brightBlue + colors.bold));
console.log(colorize('═'.repeat(70), colors.brightBlue) + '\n');

// Show all agent colors
const agents = ['research', 'implementation', 'testing', 'debug', 'documentation', 'performance', 'security'];

for (const agent of agents) {
  console.log(agentHeader(agent));
  console.log(sectionHeader('Sample Section', agent));
  const scheme = agentColors[agent];
  console.log(colorize(`  This is how ${agent} agent output looks`, scheme.primary));
  console.log(colorize('  • Bullet point 1', scheme.primary));
  console.log(colorize('  • Bullet point 2', scheme.primary));
  console.log('');
}

// Show workflow stages
console.log('\n' + colorize('═'.repeat(70), colors.brightYellow));
console.log(colorize('🔄 WORKFLOW STAGES PREVIEW', colors.brightYellow + colors.bold));
console.log(colorize('═'.repeat(70), colors.brightYellow) + '\n');

console.log(formatWorkflowStage('research_and_planning', ['research'], false));
console.log(formatWorkflowStage('quality_assurance', ['testing', 'security'], true));

// Show status messages
console.log('\n' + colorize('═'.repeat(70), colors.brightGreen));
console.log(colorize('✨ STATUS MESSAGES', colors.brightGreen + colors.bold));
console.log(colorize('═'.repeat(70), colors.brightGreen) + '\n');

console.log(success('Task completed successfully'));
console.log(error('An error occurred'));
console.log(warning('This is a warning'));
console.log(info('Informational message'));

console.log('\n' + colorize('═'.repeat(70), colors.brightBlue));
console.log(colorize('END PREVIEW', colors.brightBlue + colors.bold));
console.log(colorize('═'.repeat(70), colors.brightBlue) + '\n');
