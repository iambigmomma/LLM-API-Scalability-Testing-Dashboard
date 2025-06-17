"use client"
import { useState } from 'react'

interface GrafanaDashboardProps {
  dashboardUrl?: string
  height?: string
  width?: string
  className?: string
  showLink?: boolean
}

export default function GrafanaDashboard({ 
  dashboardUrl, 
  height = "600px",
  width = "100%",
  className = "",
  showLink = true
}: GrafanaDashboardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // If no dashboard URL is provided, don't render anything
  if (!dashboardUrl) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Monitoring Dashboard</h3>
        <p className="text-gray-600">
          Configure a Grafana dashboard URL in settings to enable real-time monitoring.
        </p>
      </div>
    )
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const openInNewTab = () => {
    window.open(dashboardUrl, '_blank')
  }

  return (
    <div className={`relative ${className}`}>
      {/* Header with link */}
      {showLink && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-900">Real-time Metrics</h3>
            <span className="text-sm text-gray-500">
              (Refreshes every 2 seconds)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openInNewTab}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in Grafana
            </button>
          </div>
        </div>
      )}

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
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-red-800 mb-2">Dashboard Loading Failed</h3>
          <p className="text-red-600 mb-4">
            Unable to load the Grafana dashboard. Please check your dashboard URL and network connection.
          </p>
          
          <div className="text-sm text-gray-600 mb-4">
            <p>Dashboard URL: <code className="bg-gray-200 px-2 py-1 rounded text-xs break-all">{dashboardUrl}</code></p>
          </div>
          
          <button
            onClick={openInNewTab}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            🔗 Open in New Tab
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
        title="Grafana Dashboard"
        allow="fullscreen"
      />
    </div>
  )
} 