"use client"
import { useState, useEffect } from 'react'
import { getGrafanaDashboardUrl, getGrafanaBaseUrl } from '../config/dashboard-config'

interface GrafanaDashboardProps {
  dashboardUrl?: string
  height?: string
  width?: string
  className?: string
  showLink?: boolean
}

export default function GrafanaDashboard({ 
  dashboardUrl = getGrafanaDashboardUrl(true), 
  height = "600px",
  width = "100%",
  className = "",
  showLink = true
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

  const openInNewTab = () => {
    window.open(getGrafanaDashboardUrl(false), '_blank')
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
            {/* <a
              href={getGrafanaBaseUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Grafana Home
            </a> */}
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
          <div className="text-red-500 mb-2">
            <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Dashboard Unavailable</h3>
          <p className="text-red-600 mb-4">
            Unable to load Grafana dashboard. Please ensure Grafana is accessible.
          </p>
          <div className="text-sm text-gray-600 mb-4">
            <p>Dashboard URL: <code className="bg-gray-200 px-2 py-1 rounded text-xs break-all">{dashboardUrl}</code></p>
            <p className="mt-2">Grafana Home: <code className="bg-gray-200 px-2 py-1 rounded text-xs">{getGrafanaBaseUrl()}</code></p>
          </div>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => {
                setHasError(false)
                setIsLoading(true)
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
            >
              Retry
            </button>
            <a
              href={getGrafanaBaseUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Open Grafana
            </a>
          </div>
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