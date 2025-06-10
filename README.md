# LLM API Scalability Testing Dashboard

A high-frequency load testing dashboard for backend LLM API performance analysis and scalability testing.

## Features

- **High-Frequency Load Testing**: Configure concurrent requests, total requests, and batch intervals
- **Diverse Test Questions**: 100+ curated questions across different topics for realistic testing scenarios
- **Real-time Results**: Live feed of API responses with collapsible display and expandable details
- **Performance Statistics**: Comprehensive metrics including latency, throughput, and success rates
- **Grafana Integration**: Placeholder for monitoring dashboard integration (port 3001)
- **Configurable Testing**: Switch between custom messages or diverse question sets

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend LLM API running on `http://localhost:8000`
- Grafana dashboard (optional, running on port 3001)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Production

```bash
npm run build
npm start
```

## Usage

### Test Configuration

1. **Test Questions**: Choose between:
   - **Custom Message**: Enter your own test message
   - **Diverse Questions**: Use 100+ curated questions covering various topics (recommended for realistic testing)
2. **Concurrent Requests**: Set how many requests to send simultaneously (1-50)
3. **Total Requests**: Configure the total number of requests for the test (10-1000)
4. **Batch Interval**: Set the delay between batches in milliseconds (0-2000ms)

### Running Load Tests

1. Configure your test parameters in the left panel
2. Enable "Use Diverse Test Questions" for more realistic testing scenarios
3. Click "Start Load Test" to begin the scalability test
4. Monitor real-time results in the main panel (click "Show Results" to expand)
5. Click on individual results to expand full responses
6. View comprehensive statistics after test completion
7. Use "Stop" to halt a running test or "Clear Results" to reset

### Test Results

The dashboard provides:
- **Collapsible Results Display**: Toggle visibility of real-time results to reduce clutter
- **Expandable Response Details**: Click arrows to view full responses or keep them collapsed
- **Question Tracking**: See which question was asked for each request
- **Success/Failure Tracking**: Visual indicators for request status
- **Response Times**: Latency measurements for each request
- **Statistics Panel**: Aggregated metrics including:
  - Total and successful requests
  - Success rate percentage
  - Average, minimum, and maximum latency
  - Requests per second throughput

### Grafana Integration

The dashboard includes a placeholder for Grafana dashboard integration:
- Grafana should be running on port 3001
- Dashboard will show real-time monitoring metrics
- Integration can be completed by replacing the placeholder with actual iframe

## API Configuration

The dashboard uses a Next.js API proxy to communicate with the backend LLM API:
- **Frontend Endpoint**: `/api/chat` (local proxy)
- **Backend Endpoint**: `http://localhost:8000/v1/chat/completions`
- **Model**: `deepseek-ai/DeepSeek-R1-Distill-Llama-8B`
- **Max Tokens**: 300
- **Stream**: false

The proxy route handles CORS issues and provides better error handling. To modify the backend API configuration, edit `src/app/api/chat/route.ts`.

## Architecture

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **HTTP Client**: Native fetch API
- **State Management**: React hooks
- **Real-time Updates**: React state with auto-scrolling results

## Monitoring Setup

For complete monitoring integration, ensure the following services are running:
- Prometheus (port 9090)
- Grafana (port 3001) 
- Loki (port 3100)
- Backend LLM API with metrics endpoint

Refer to the `monitoring/` directory for deployment configuration.

## Development

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # API proxy for backend LLM API
│   ├── page.tsx              # Main dashboard component
│   ├── layout.tsx            # App layout
│   └── globals.css           # Global styles
├── components/
│   └── GrafanaDashboard.tsx  # Grafana integration component
├── data/
│   └── testQuestions.ts      # 100+ diverse test questions
└── hooks/
    └── useChatCompletion.ts  # Chat API hook
```

### Key Components

- **Load Testing Engine**: Handles concurrent request batching and execution
- **Real-time Results Display**: Live feed with auto-scrolling
- **Statistics Calculator**: Aggregates performance metrics
- **Progress Tracking**: Visual progress bar and completion status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
