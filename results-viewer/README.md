# Agent Results Viewer

A Next.js web application for viewing and exploring agent workflow results from LocalAgentCrew.

## Features

- **Dashboard**: Overview statistics, recent sessions, most used agents
- **Session Browser**: Filter and search through all workflow sessions
- **File Browser**: Navigate the results directory structure
- **Filters**: Filter by status, date range, agents, tags, and keywords
- **Session Details**: View detailed results for each agent in a session

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd results-viewer
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

1. Push the repository to GitHub
2. Import the project in Vercel
3. Set the root directory to `results-viewer`
4. Configure environment variables if needed:
   - `RESULTS_PATH`: Path to the `.agent-results` directory (default: `../.agent-results`)

## Results Storage Schema

Results are stored in `.agent-results/` with the following structure:

```
.agent-results/
├── sessions/
│   └── [YYYY-MM-DD]/
│       └── [session-id]/
│           ├── session.json     # Session metadata
│           ├── query.md         # Original query
│           ├── summary.md       # Generated summary
│           └── agents/
│               └── [agent-name]/
│                   ├── metadata.json  # Agent result metadata
│                   ├── result.md      # Agent output
│                   └── artifacts/     # Generated files
├── index.json                   # Global session index
└── schema/
    └── v1.json                  # Schema definition
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/sessions` | GET | List sessions with optional filters |
| `/api/sessions/[id]` | GET | Get session details |
| `/api/statistics` | GET | Get dashboard statistics |
| `/api/tree` | GET | Get file tree structure |
| `/api/file` | GET | Get file content |

### Query Parameters for `/api/sessions`

- `status`: Filter by status (comma-separated: `running,completed,failed,cancelled`)
- `agents`: Filter by agents used (comma-separated)
- `tags`: Filter by tags (comma-separated)
- `workflow`: Filter by workflow type
- `search`: Search query text
- `startDate`, `endDate`: Date range filter (YYYY-MM-DD)

## Usage in Your Agent Workflow

To store results from your agent workflows, use the storage writer utilities:

```typescript
import { createSession, addAgentResult, completeSession } from './lib/storage-writer';

// Start a new session
const session = await createSession({
  query: 'Your task description',
  workflow: 'custom-workflow',
  tags: ['feature', 'priority-high'],
});

const date = session.createdAt.split('T')[0];

// Add agent results
await addAgentResult(session.id, date, {
  agentName: 'research',
  model: 'haiku',
  status: 'completed',
  // ... other metadata
}, 'Agent output in markdown');

// Complete the session
await completeSession(session.id, date, {
  status: 'completed',
  summary: 'Session completed successfully',
});
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Markdown**: react-markdown
- **Dates**: date-fns

## License

MIT
