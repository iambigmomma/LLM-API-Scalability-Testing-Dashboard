# 🚀 LLM API Scalability Testing Dashboard

A comprehensive dashboard for testing and monitoring LLM API performance with real-time metrics visualization through Grafana integration.

## ✨ Features

- **Load Testing**: Configure concurrent requests, batch intervals, and test parameters
- **Real-time Monitoring**: Live feed of API responses with expandable answers
- **Performance Analytics**: Detailed statistics including latency, success rates, and throughput
- **Grafana Integration**: Embedded real-time metrics dashboard with direct links
- **Diverse Testing**: Support for custom messages or curated question sets

## 🛠️ Prerequisites

Before running this dashboard, ensure you have:

1. **Node.js** (v18 or higher)
2. **Grafana** running with LLM Worker Metrics dashboard
3. **LLM API endpoint** accessible for testing

## ⚙️ Configuration

### 1. Server IP Configuration

**IMPORTANT**: Before running the dashboard, you must configure your server's IP address.

Edit the file `src/config/dashboard-config.ts` and update the `SERVER_IP` value:

```typescript
export const config = {
  // Update this IP address to match your server's IP
  SERVER_IP: "YOUR_SERVER_IP_HERE",  // Replace with your actual IP
  
  // Ports configuration
  GRAFANA_PORT: 3000,
  DASHBOARD_PORT: 3050,
  
  // ... other configurations
}
```

### 2. Grafana Setup

Ensure your Grafana instance is configured to:

1. **Allow iframe embedding**: Set `allow_embedding = true` in grafana.ini
2. **Enable anonymous access**: Set `[auth.anonymous] enabled = true` in grafana.ini
3. **Have the LLM Worker Metrics dashboard** with ID `llm-worker-metrics`

#### Quick Grafana Configuration Commands:

```bash
# Enable iframe embedding
docker exec -u root grafana sh -c "sed -i 's/;allow_embedding = false/allow_embedding = true/' /etc/grafana/grafana.ini"

# Enable anonymous access
docker exec -u root grafana sh -c "sed -i 's/;enabled = false/enabled = true/' /etc/grafana/grafana.ini"

# Restart Grafana
docker restart grafana
```

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd LLM-API-Scalability-Testing-Dashboard
   ```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure your server IP** (see Configuration section above)

4. **Start the development server**:
```bash
   npm run dev -- --port 3050
   ```

5. **Access the dashboard**:
   - Open your browser and navigate to: `http://YOUR_SERVER_IP:3050`
   - Replace `YOUR_SERVER_IP` with your actual server IP address

## 📊 Dashboard Components

### Test Configuration Panel
- **Diverse Test Questions**: Toggle between custom messages and curated question sets
- **Concurrent Requests**: Control parallel request execution (1-50)
- **Total Requests**: Set the total number of requests (10-1000)
- **Batch Interval**: Configure delay between request batches (0-2000ms)
- **Temperature**: Adjust LLM creativity (0.0-2.0)
- **Max Tokens**: Control response length (50-1000)

### Test Statistics
- **Total Requests**: Number of completed requests
- **Success Rate**: Percentage of successful responses
- **Average Latency**: Mean response time
- **Requests/sec**: Throughput measurement
- **Min/Max Latency**: Response time range
- Shows "N/A" when no test data is available

### Real-time Test Results
- Live feed of API responses (last 50 results)
- Expandable answers for detailed viewing
- Color-coded success/failure indicators
- Question and answer pairs with timestamps

### Monitoring Dashboard
- **Embedded Grafana Dashboard**: Real-time LLM worker metrics
- **Direct Links**: 
  - "Open in Grafana" - Opens dashboard in new tab
  - "Grafana Home" - Access main Grafana interface
- **Auto-refresh**: Updates every 2 seconds
- **Error Handling**: Fallback options if Grafana is unavailable

## 🔧 Configuration Files

### `src/config/dashboard-config.ts`
Central configuration file containing:
- Server IP and port settings
- Grafana dashboard parameters
- URL generation helpers

### Key Configuration Options:
```typescript
{
  SERVER_IP: "YOUR_IP",           // Your server's IP address
  GRAFANA_PORT: 3000,             // Grafana port
  DASHBOARD_PORT: 3050,           // Dashboard port
  GRAFANA_DASHBOARD_ID: "llm-worker-metrics",
  GRAFANA_ORG_ID: 1,
  GRAFANA_PARAMS: {
    from: "now-5m",               // Time range start
    to: "now",                    // Time range end
    timezone: "browser",          // Timezone setting
    component: "VllmWorker",      // Component filter
    endpoint: "load_metrics",     // Endpoint filter
    refresh: "2s"                 // Refresh interval
  }
}
```

## 🌐 Network Access

The dashboard will be accessible at:
- **Local**: `http://localhost:3050`
- **Network**: `http://YOUR_SERVER_IP:3050`

Make sure your firewall allows access to port 3050 if you need external access.

## 🔗 Grafana Integration

The dashboard integrates with Grafana in several ways:

1. **Embedded Dashboard**: Full Grafana dashboard embedded in the monitoring section
2. **Direct Links**: Quick access to Grafana interface
3. **Real-time Updates**: Automatic refresh every 2 seconds
4. **Error Handling**: Graceful fallback when Grafana is unavailable

### Grafana URLs:
- **Dashboard**: `http://YOUR_SERVER_IP:3000/d/llm-worker-metrics/...`
- **Home**: `http://YOUR_SERVER_IP:3000`

## 🛠️ Development

### Available Scripts:
- `npm run dev`: Start development server with Turbopack
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Project Structure:
```
src/
├── app/
│   ├── page.tsx              # Main dashboard page
│   └── api/
│       └── chat/             # API endpoints
├── components/
│   └── GrafanaDashboard.tsx  # Grafana integration component
├── config/
│   └── dashboard-config.ts   # Configuration file
├── data/
│   └── testQuestions.ts      # Curated test questions
└── hooks/
    └── useChatCompletion.ts  # Chat API hook
```

## 🔍 Troubleshooting

### Common Issues:

1. **Grafana not loading**:
   - Check if Grafana is running: `docker ps | grep grafana`
   - Verify IP address in dashboard-config.ts
   - Ensure iframe embedding is enabled

2. **Dashboard not accessible**:
   - Verify the SERVER_IP in dashboard-config.ts matches your actual IP
   - Check if port 3050 is available
   - Ensure firewall allows access to port 3050

3. **API requests failing**:
   - Check if the LLM API endpoint is accessible
   - Verify network connectivity
   - Check browser console for error messages

### Debug Steps:
1. Check browser console for JavaScript errors
2. Verify Grafana accessibility: `curl http://YOUR_IP:3000`
3. Test dashboard accessibility: `curl http://YOUR_IP:3050`
4. Check Docker containers: `docker ps`

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Update the configuration documentation if needed
5. Submit a pull request

---

**Note**: Remember to update the `SERVER_IP` in `src/config/dashboard-config.ts` before deploying or sharing this dashboard!
