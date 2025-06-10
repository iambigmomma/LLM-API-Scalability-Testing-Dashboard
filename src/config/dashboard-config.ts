// Configuration file for the LLM API Scalability Testing Dashboard
// Please update the SERVER_IP to match your server's IP address

export const config = {
  // Update this IP address to match your server's IP
  SERVER_IP: "165.227.40.179",
  
  // Ports configuration
  GRAFANA_PORT: 3000,
  DASHBOARD_PORT: 3050,
  
  // Grafana Dashboard configuration
  GRAFANA_DASHBOARD_ID: "llm-worker-metrics",
  GRAFANA_ORG_ID: 1,
  
  // Default dashboard parameters
  GRAFANA_PARAMS: {
    from: "now-5m",
    to: "now",
    timezone: "browser",
    component: "VllmWorker",
    endpoint: "load_metrics",
    refresh: "2s"
  }
}

// Helper functions to generate URLs
export const getGrafanaBaseUrl = () => `http://${config.SERVER_IP}:${config.GRAFANA_PORT}`

export const getGrafanaDashboardUrl = (kiosk: boolean = true) => {
  const baseUrl = getGrafanaBaseUrl()
  const params = new URLSearchParams({
    orgId: config.GRAFANA_ORG_ID.toString(),
    from: config.GRAFANA_PARAMS.from,
    to: config.GRAFANA_PARAMS.to,
    timezone: config.GRAFANA_PARAMS.timezone,
    'var-component': config.GRAFANA_PARAMS.component,
    'var-endpoint': config.GRAFANA_PARAMS.endpoint,
    refresh: config.GRAFANA_PARAMS.refresh,
    ...(kiosk && { kiosk: 'true' })
  })
  
  return `${baseUrl}/d/${config.GRAFANA_DASHBOARD_ID}/${config.GRAFANA_DASHBOARD_ID}?${params.toString()}`
}

export const getDashboardUrl = () => `http://${config.SERVER_IP}:${config.DASHBOARD_PORT}` 