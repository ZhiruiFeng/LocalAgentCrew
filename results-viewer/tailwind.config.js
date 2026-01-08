/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Agent category colors (matching ANSI scheme)
        agent: {
          research: '#06b6d4',      // Cyan
          implementation: '#22c55e', // Green
          debug: '#ef4444',          // Red
          testing: '#eab308',        // Yellow
          documentation: '#3b82f6',  // Blue
          performance: '#d946ef',    // Magenta
          security: '#f97316',       // Orange
        },
        // Status colors
        status: {
          running: '#3b82f6',
          completed: '#22c55e',
          failed: '#ef4444',
          cancelled: '#6b7280',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
