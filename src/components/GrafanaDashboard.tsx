"use client"
import { useState, useEffect } from 'react'

interface GrafanaDashboardProps {
  dashboardUrl?: string
  height?: string
  width?: string
  className?: string
}

export default function GrafanaDashboard({ 
  dashboardUrl = "http://165.227.40.179:3000/d/llm-worker-metrics/llm-worker-metrics?orgId=1&from=now-5m&to=now&timezone=browser&var-component=VllmWorker&var-endpoint=load_metrics&refresh=2s&kiosk", 
  height = "600px",
  width = "100%",
  className = ""
}: GrafanaDashboardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading Grafana Dashboard...</p>
          </div>
        </div>
      )}
      
      {hasError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-500 mb-2">
            <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Dashboard Unavailable</h3>
          <p className="text-red-600 mb-4">
            Unable to load Grafana dashboard. Please ensure Grafana is accessible at {dashboardUrl}.
          </p>
          <div className="text-sm text-gray-600 mb-4">
            <p>Dashboard URL: <code className="bg-gray-200 px-2 py-1 rounded text-xs">{dashboardUrl}</code></p>
          </div>
          <button 
            onClick={() => {
              setHasError(false)
              setIsLoading(true)
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      )}

      <iframe
        src={dashboardUrl}
        width={width}
        height={height}
        frameBorder="0"
        onLoad={handleLoad}
        onError={handleError}
        className={`rounded-lg border ${isLoading || hasError ? 'hidden' : 'block'}`}
        title="Grafana LLM Worker Metrics Dashboard"
        allow="fullscreen"
      />
    </div>
  )
} 