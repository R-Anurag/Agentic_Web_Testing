# TestPilot AI

AI-powered autonomous testing agent that intelligently explores and tests web applications using LangGraph decision-making and browser automation.

## Prerequisites

- **Node.js >= 18**
- **Docker** (for Qdrant vector database)
- **VS Code** (optional, for extension)

## Setup

### 1. Install Dependencies
```bash
npm install
cd runtime-discovery && npm install
cd azure-integration && npm install
cd dad-graph-ui && npm install
cd vscode-extension && npm install
```

### 2. Start Qdrant Vector Database

**Windows (PowerShell):**
```powershell
# Using Docker (recommended)
docker run -p 6333:6333 -v ${PWD}/qdrant_data:/qdrant/storage qdrant/qdrant

# Or download binary
Invoke-WebRequest -Uri "https://github.com/qdrant/qdrant/releases/latest/download/qdrant-x86_64-pc-windows-msvc.zip" -OutFile "qdrant.zip"
Expand-Archive -Path "qdrant.zip" -DestinationPath "."
.\qdrant.exe
```

**Windows (CMD):**
```cmd
# Using Docker (recommended)
docker run -p 6333:6333 -v %cd%/qdrant_data:/qdrant/storage qdrant/qdrant

# Or download binary
curl -L https://github.com/qdrant/qdrant/releases/latest/download/qdrant-x86_64-pc-windows-msvc.zip -o qdrant.zip
tar -xf qdrant.zip
qdrant.exe
```

**Linux/macOS:**
```bash
# Using Docker (recommended)
docker run -p 6333:6333 -v $(pwd)/qdrant_data:/qdrant/storage qdrant/qdrant

# Or download binary
wget https://github.com/qdrant/qdrant/releases/latest/download/qdrant-x86_64-unknown-linux-gnu.tar.gz
tar -xzf qdrant-x86_64-unknown-linux-gnu.tar.gz
./qdrant
```

**Initialize Collection:**
```bash
npm run create-collection
```

### 3. Configure Environment
```bash
# Configure Azure integration (optional)
cd azure-integration
# Edit .env file with your Azure credentials
# AZURE_COSMOS_ENDPOINT, AZURE_COSMOS_KEY, etc.
```

### 4. Install Playwright Browsers
```bash
cd runtime-discovery
npx playwright install
```

## Usage

### Run Autonomous Testing
```bash
# Start the agent with a target URL
npm start https://your-app-url.com

# Or run headful (with visible browser)
npm run start-headful https://your-app-url.com
```

### Start Azure Integration Server
```bash
cd azure-integration
npm start
# Server runs on http://localhost:3000
```

### Launch Graph UI Dashboard
```bash
cd dad-graph-ui
npm run dev
# Dashboard runs on http://localhost:5173
```

### Test Knowledge Base
```bash
npm run test-kb
```

### Analyze Results
```bash
node error-intelligence/run-pipeline.mjs runs/<run-id>.json reports/analysis.json
```

## Architecture

### 🧠 LangGraph Agent Pipeline (`langraph/`)
- **Anomaly Detection** - Identifies UI/network issues
- **Diagnosis** - Analyzes root causes  
- **Memory** - Maintains testing context
- **Decision Engine** - AI-powered action selection
- **Executor** - Safe action execution with confidence thresholds
- **Validator** - Result verification
- **Learner** - Knowledge accumulation

### 🔍 Runtime Discovery (`runtime-discovery/`)
- Dynamic UI action discovery (buttons, links, forms, inputs, selects)
- Network monitoring and console error tracking
- Screenshot capture with stability detection
- Playwright-based browser automation
- Test execution and run management

### 📊 Error Intelligence (`error-intelligence/`)
- Multi-stage analysis pipeline
- Azure Vision safety checks
- Performance monitoring
- Evidence correlation (screenshots + network traces)
- Automated report generation

### ☁️ Azure Integration (`azure-integration/`)
- Azure Cosmos DB for data storage
- Azure Monitor for performance metrics
- Azure Computer Vision for screenshot analysis
- RESTful API server for external integrations

### 🎨 Graph UI Dashboard (`dad-graph-ui/`)
- React-based visualization dashboard
- Real-time graph rendering with ReactFlow
- Test execution monitoring
- Interactive node inspection

### 🧮 Knowledge Management (`knowledge/`)
- **Qdrant Vector Database** (port 6333)
- **Local Embeddings** (@xenova/transformers, 384-dim)
- **Azure Embeddings** (optional, 1536-dim)
- Semantic search for learned behaviors
- Success/failure pattern recognition
- Confidence scoring for solutions

### 🧪 Test Application (`test-app/`)
- Sample React application for testing
- Multiple pages and components
- Form flows and error scenarios
- Development target for agent testing

## VS Code Integration

```bash
cd vscode-extension
npm run compile
# Press F5 to launch extension development host
# Or install the compiled extension in VS Code
```

## Output Structure

- **`runtime-discovery/runs/`** - Test execution traces (JSON)
- **`runtime-discovery/screenshots/`** - UI screenshots during testing
- **`reports/`** - Analysis reports and intelligence outputs
- **`qdrant_data/`** - Vector database storage
- **`storage/`** - Additional graph storage
- **Knowledge Base** - Stored at `http://localhost:6333`

## Components

### Core Services
- **Main Agent** - Entry point and orchestration
- **Runtime Discovery** - Browser automation and UI exploration
- **LangGraph Engine** - AI decision-making pipeline
- **Knowledge Base** - Vector storage and retrieval
- **Error Intelligence** - Analysis and reporting

### Integration Services
- **Azure Integration** - Cloud services and monitoring
- **Graph UI** - Visual dashboard and monitoring
- **VS Code Extension** - IDE integration

### Development Tools
- **Test App** - Sample application for testing
- **Shared Types** - Common type definitions

## Troubleshooting

**Qdrant Connection Issues:**
```bash
# Check if Qdrant is running
curl http://localhost:6333/collections

# Restart Qdrant
docker restart <qdrant-container-id>
```

**Missing Dependencies:**
```bash
# Install all dependencies
npm install
cd runtime-discovery && npm install
cd ../vscode-extension && npm install
```
