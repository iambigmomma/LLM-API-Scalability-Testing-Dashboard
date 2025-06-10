# 🚀 Quick Setup Guide

## ✅ Current Status
Your dashboard is now **READY TO USE**!

## 🌐 Access URLs

### Dashboard
- **URL**: http://165.227.40.179:3050
- **Status**: ✅ Running
- **Features**: Load testing, real-time monitoring, performance analytics

### Grafana
- **URL**: http://165.227.40.179:3000
- **Status**: ✅ Running
- **Integration**: Embedded in dashboard + direct links

## 🎯 What's Been Configured

### ✅ Completed Setup
1. **Server IP Configuration**: Set to `165.227.40.179`
2. **Port Configuration**: Dashboard on `3050`, Grafana on `3000`
3. **Grafana Integration**: Embedded dashboard with hyperlinks
4. **Test Statistics**: Shows "N/A" when no data available
5. **Configuration File**: `src/config/dashboard-config.ts` created
6. **Documentation**: Comprehensive README updated

### 🔧 Key Features Implemented
- **Dynamic IP Configuration**: No more hardcoded IPs
- **Grafana Hyperlinks**: Direct access to Grafana dashboard
- **Enhanced Statistics**: Proper "N/A" display for empty data
- **Error Handling**: Graceful fallback when Grafana unavailable
- **Real-time Updates**: Auto-refresh every 2 seconds

## 🚀 How to Use

1. **Open the Dashboard**: http://165.227.40.179:3050
2. **Configure Test Parameters**:
   - Toggle "Use Diverse Test Questions" for realistic testing
   - Set concurrent requests (1-50)
   - Set total requests (10-1000)
   - Adjust batch interval (0-2000ms)
3. **Start Load Testing**: Click "Start Load Test"
4. **Monitor Results**: View real-time responses and statistics
5. **Check Grafana**: Use embedded dashboard or click "Open in Grafana"

## 📊 Dashboard Sections

### Test Configuration Panel (Left)
- Diverse test questions toggle
- Concurrent requests slider
- Total requests input
- Batch interval setting
- Temperature and max tokens controls

### Test Statistics (Top Right)
- Total requests count
- Success rate percentage
- Average latency
- Requests per second
- Min/Max latency
- Shows "N/A" when no test data

### Real-time Results (Middle Right)
- Live feed of API responses
- Expandable answer details
- Color-coded success/failure
- Auto-scroll to latest results

### Monitoring Dashboard (Bottom)
- Embedded Grafana dashboard
- "Open in Grafana" button
- Real-time metrics visualization
- Auto-refresh every 2 seconds

## 🔗 Quick Links

- **Dashboard**: http://165.227.40.179:3050
- **Grafana**: http://165.227.40.179:3000
- **Configuration**: `src/config/dashboard-config.ts`
- **Documentation**: `README.md`

## 🛠️ If You Need to Change IP

Edit `src/config/dashboard-config.ts`:
```typescript
export const config = {
  SERVER_IP: "YOUR_NEW_IP_HERE",  // Change this line
  // ... rest of config
}
```

Then restart the server:
```bash
npm run dev -- --port 3050
```

## ✨ You're All Set!

Your LLM API Scalability Testing Dashboard is now fully configured and ready for use. Enjoy testing! 🎉 