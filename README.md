# AGEN8 - AI-Powered n8n Workflow Generator

A professional-grade platform for generating n8n workflows from natural language prompts using AI automation.

## 🚀 Features

- **AI-Powered Workflow Generation**: Create complex n8n workflows using natural language
- **Visual Workflow Editor**: Interactive drag-and-drop interface with React Flow
- **Code Generation**: Export workflows as JSON for n8n
- **Direct n8n Integration**: Deploy workflows directly to your n8n instance
- **Memory System**: Persistent conversation memory with Supabase
- **Multiple LLM Providers**: Support for OpenAI, Gemini, Claude, and Mistral
- **Dark/Light Mode**: Professional UI with theme switching
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React Flow** - Interactive workflow visualization
- **Monaco Editor** - Advanced code editor for JSON
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Professional component library
- **Zustand** - State management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database and authentication
- **Multiple LLM APIs** - OpenAI, Gemini, Claude, Mistral integration

## 📁 Project Structure

```
agen8/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # UI components (Radix UI)
│   ├── ChatInterface.tsx # AI chat interface
│   ├── CodeEditor.tsx    # Workflow code editor
│   ├── DeployModal.tsx   # n8n deployment modal
│   └── ...               # Other components
├── database/             # Database setup and migrations
├── docs/                 # Documentation
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── public/               # Static assets
├── scripts/              # Build and deployment scripts
└── store/                # State management
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for at least one LLM provider

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-vibe-coding-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   # Choose one or more LLM providers
   OPENAI_API_KEY=your_openai_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Default provider
   DEFAULT_LLM_PROVIDER=openai
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Basic Workflow Generation

1. **Enter a prompt** describing your desired automation:
   ```
   "When I receive an email with an attachment, save it to Google Drive and send a Slack notification"
   ```

2. **Select your preferred LLM provider** from the header dropdown

3. **Click generate** and watch as the AI creates your workflow

4. **View the results**:
   - JSON editor on the left shows the generated workflow code
   - Visual preview on the right displays the workflow graph

5. **Edit and refine**:
   - Modify the JSON directly in the editor
   - Update your prompt and regenerate
   - Click on nodes in the visualization to see details

6. **Export your workflow**:
   - Download as JSON file
   - Copy to clipboard
   - Import into your n8n instance

### Example Prompts

- "Monitor my website for downtime and send SMS alerts when it's offline"
- "Sync new Airtable records to a Google Sheet and create Trello cards"
- "Process new form submissions by validating data and storing in database"
- "Automatically backup files from Dropbox to AWS S3 daily"

## API Endpoints

### POST /api/generate-workflow

Generate an n8n workflow from a natural language prompt.

**Request Body:**
```json
{
  "prompt": "Your workflow description",
  "provider": "openai" // or "groq", "gemini"
}
```

**Response:**
```json
{
  "workflow": {
    "name": "Generated Workflow",
    "nodes": [...],
    "connections": {...},
    "active": false,
    "settings": {}
  }
}
```

## Supported n8n Node Types

The platform supports generation of common n8n nodes including:

- **Triggers**: Start, Webhook, Cron, Email
- **Actions**: HTTP Request, Function, Set, Merge
- **Integrations**: Gmail, Slack, Google Drive, Sheets, Trello, Airtable
- **Logic**: If, Switch, Wait
- **Cloud**: AWS, Dropbox

## Development

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Header.tsx         # App header
│   ├── PromptInput.tsx    # Prompt input form
│   ├── WorkflowEditor.tsx # JSON editor
│   ├── WorkflowVisualization.tsx # Flow diagram
│   └── CustomNode.tsx     # Custom node component
├── lib/                   # Utility libraries
│   └── llm/              # LLM integrations
│       ├── openai.ts
│       ├── groq.ts
│       └── gemini.ts
├── store/                 # State management
│   └── workflowStore.ts   # Zustand store
└── public/               # Static assets
```

### Adding New LLM Providers

1. Create a new file in `lib/llm/`
2. Implement the provider interface
3. Add to the API route handler
4. Update the provider selector in the UI

### Customizing Node Types

Edit `components/CustomNode.tsx` to:
- Add new node icons
- Customize node colors
- Add node-specific styling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Common Issues

**API Connection Errors**
- Check your internet connection
- Verify API keys are correctly set in `.env.local`
- Try switching to a different LLM provider
- The platform includes automatic fallback to other providers

**Workflow Generation Fails**
- Ensure your prompt is descriptive (minimum 10 characters)
- Try using one of the example prompts
- Check browser console for detailed error messages
- The platform will generate a basic template if all APIs fail

**Visual Issues**
- Clear browser cache and reload
- Ensure JavaScript is enabled
- Try a different browser
- Check for browser console errors

**Development Server Issues**
- Ensure Node.js 18+ is installed
- Delete `node_modules` and run `npm install` again
- Check for port conflicts (default: 3000)
- Use `npm run build` to test production build

### Testing Your Setup

Run the test script to verify everything is working:
```bash
node test-api.js
```

Or use the PowerShell startup script:
```powershell
./start.ps1
```

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review example workflows
- Run the test script to diagnose issues

## Roadmap

- [ ] User authentication and saved workflows
- [ ] Direct n8n instance integration
- [ ] Workflow templates library
- [ ] Real-time collaboration
- [ ] Advanced node configuration
- [ ] Workflow testing and validation
- [ ] Community workflow sharing