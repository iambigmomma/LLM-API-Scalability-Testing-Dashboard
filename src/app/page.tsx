"use client"
import { useState, useRef, useEffect } from "react"
import { useChatCompletion, ChatMessage } from "../hooks/useChatCompletion"
import { getQuestionByIndex, testQuestions } from "../data/testQuestions"
import GrafanaDashboard from "../components/GrafanaDashboard"

interface TestResult {
  id: string
  timestamp: number
  duration: number
  ttft: number // Time to First Token
  success: boolean
  error?: string
  response?: string
  requestSize: number
  question: string
  tokensReceived?: number
}

interface TestStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageLatency: number
  averageTTFT: number
  minLatency: number
  maxLatency: number
  minTTFT: number
  maxTTFT: number
  requestsPerSecond: number
  totalDuration: number
  averageTokensPerSecond?: number
}

export default function Home() {
  const [testMessage, setTestMessage] = useState("Hello, how are you today?")
  const [useRandomQuestions, setUseRandomQuestions] = useState(false)
  const [useStreaming, setUseStreaming] = useState(true)
  const [concurrentRequests, setConcurrentRequests] = useState(5)
  const [totalRequests, setTotalRequests] = useState(100)
  const [requestInterval, setRequestInterval] = useState(100) // ms
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(300)
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [stats, setStats] = useState<TestStats | null>(null)
  const [progress, setProgress] = useState(0)
  const [realtimeResults, setRealtimeResults] = useState<TestResult[]>([])
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set())
  const [showQuestionsModal, setShowQuestionsModal] = useState(false)
  
  const { sendChat } = useChatCompletion()
  const abortControllerRef = useRef<AbortController | null>(null)

  const calculateStats = (testResults: TestResult[]): TestStats => {
    const successful = testResults.filter(r => r.success)
    const failed = testResults.filter(r => !r.success)
    const latencies = successful.map(r => r.duration)
    const ttfts = successful.map(r => r.ttft).filter(t => t > 0)
    
    const totalDuration = testResults.length > 0 
      ? Math.max(...testResults.map(r => r.timestamp)) - Math.min(...testResults.map(r => r.timestamp))
      : 0

    const totalTokens = successful.reduce((sum, r) => sum + (r.tokensReceived || 0), 0)
    const totalResponseTime = successful.reduce((sum, r) => sum + r.duration, 0)

    return {
      totalRequests: testResults.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      averageLatency: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
      averageTTFT: ttfts.length > 0 ? ttfts.reduce((a, b) => a + b, 0) / ttfts.length : 0,
      minLatency: latencies.length > 0 ? Math.min(...latencies) : 0,
      maxLatency: latencies.length > 0 ? Math.max(...latencies) : 0,
      minTTFT: ttfts.length > 0 ? Math.min(...ttfts) : 0,
      maxTTFT: ttfts.length > 0 ? Math.max(...ttfts) : 0,
      requestsPerSecond: totalDuration > 0 ? (testResults.length / totalDuration) * 1000 : 0,
      totalDuration,
      averageTokensPerSecond: totalResponseTime > 0 ? (totalTokens / totalResponseTime) * 1000 : 0
    }
  }

  const runSingleRequest = async (requestId: string, questionIndex: number): Promise<TestResult> => {
    const startTime = performance.now()
    const timestamp = Date.now()
    let ttftTime = 0
    let tokensReceived = 0
    let firstTokenReceived = false
    
    // Get the question to use for this request
    const currentQuestion = useRandomQuestions 
      ? getQuestionByIndex(questionIndex)
      : testMessage
    
    try {
      const messages: ChatMessage[] = [
        { role: "user", content: currentQuestion }
      ]
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "deepseek-ai/DeepSeek-R1-Distill-Llama-8B",
          messages,
          max_tokens: maxTokens,
          temperature: temperature,
          stream: useStreaming
        }),
        signal: abortControllerRef.current?.signal
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      let fullResponse = ""
      
      if (response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue
                
                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  
                  if (content) {
                    if (!firstTokenReceived) {
                      ttftTime = performance.now() - startTime
                      firstTokenReceived = true
                    }
                    fullResponse += content
                    tokensReceived++
                  }
                } catch (e) {
                  // Skip invalid JSON lines
                }
              }
            }
          }
        } finally {
          reader.releaseLock()
        }
      }
      
      const duration = performance.now() - startTime
      
      return {
        id: requestId,
        timestamp,
        duration,
        ttft: ttftTime,
        success: true,
        response: fullResponse || "No response",
        requestSize: JSON.stringify({ messages }).length,
        question: currentQuestion,
        tokensReceived
      }
    } catch (error: any) {
      const duration = performance.now() - startTime
      return {
        id: requestId,
        timestamp,
        duration,
        ttft: 0,
        success: false,
        error: error.message,
        requestSize: JSON.stringify({ messages: [{ role: "user", content: currentQuestion }] }).length,
        question: currentQuestion,
        tokensReceived: 0
      }
    }
  }

  const runLoadTest = async () => {
    setIsRunning(true)
    setResults([])
    setRealtimeResults([])
    setProgress(0)
    setStats(null)
    
    abortControllerRef.current = new AbortController()
    
    const allResults: TestResult[] = []
    let completedRequests = 0
    
    try {
      // Create batches of concurrent requests
      const batchSize = concurrentRequests
      const totalBatches = Math.ceil(totalRequests / batchSize)
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        if (abortControllerRef.current?.signal.aborted) break
        
        const batchStart = batchIndex * batchSize
        const batchEnd = Math.min(batchStart + batchSize, totalRequests)
        const currentBatchSize = batchEnd - batchStart
        
        // Create promises for current batch
        const batchPromises = Array.from({ length: currentBatchSize }, (_, i) => 
          runSingleRequest(`${batchStart + i + 1}`, batchStart + i)
        )
        
        // Execute batch concurrently
        const batchResults = await Promise.allSettled(batchPromises)
        
        // Process results
        const processedResults = batchResults.map((result, index) => 
          result.status === 'fulfilled' ? result.value : {
            id: `error-${Date.now()}-${index}`,
            timestamp: Date.now(),
            duration: 0,
            ttft: 0,
            success: false,
            error: 'Request failed',
            requestSize: 0,
            question: useRandomQuestions ? getQuestionByIndex(batchStart + index) : testMessage,
            tokensReceived: 0
          }
        )
        
        allResults.push(...processedResults)
        completedRequests += currentBatchSize
        
        // Update realtime results and progress
        setRealtimeResults([...allResults])
        setProgress((completedRequests / totalRequests) * 100)
        
        // Wait before next batch (if not the last batch)
        if (batchIndex < totalBatches - 1 && requestInterval > 0) {
          await new Promise(resolve => setTimeout(resolve, requestInterval))
        }
      }
      
      setResults(allResults)
      setStats(calculateStats(allResults))
      
    } catch (error) {
      console.error('Load test error:', error)
    } finally {
      setIsRunning(false)
      abortControllerRef.current = null
    }
  }

  const stopTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsRunning(false)
  }

  const clearResults = () => {
    setResults([])
    setRealtimeResults([])
    setStats(null)
    setProgress(0)
    setExpandedAnswers(new Set())
  }

  const toggleAnswerExpansion = (resultId: string) => {
    const newExpanded = new Set(expandedAnswers)
    if (newExpanded.has(resultId)) {
      newExpanded.delete(resultId)
    } else {
      newExpanded.add(resultId)
    }
    setExpandedAnswers(newExpanded)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🚀 LLM API Scalability Testing Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            High-frequency load testing for backend LLM API performance analysis
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Test Configuration Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">⚙️ Test Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={useRandomQuestions}
                      onChange={(e) => setUseRandomQuestions(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Use Diverse Test Questions ({testQuestions.length} questions)
                    </span>
                  </label>
                  <div className="flex gap-2 text-xs">
                    <p className="text-gray-500">
                      When enabled, each request will use a different question from our curated set
                    </p>
                    <button
                      onClick={() => setShowQuestionsModal(true)}
                      className="text-blue-600 hover:text-blue-800 underline whitespace-nowrap"
                    >
                      View Questions
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={useStreaming}
                      onChange={(e) => setUseStreaming(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Enable Streaming & TTFT Measurement
                    </span>
                  </label>
                  <p className="text-xs text-gray-500">
                    When enabled, measures Time-to-First-Token (TTFT) for better performance insights
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Test Message
                  </label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    disabled={useRandomQuestions}
                    className={`w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      useRandomQuestions 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-white text-gray-900'
                    }`}
                    rows={3}
                    placeholder={useRandomQuestions ? "Disabled when using diverse test questions" : "Enter your test message..."}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concurrent Requests: {concurrentRequests}
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={concurrentRequests}
                    onChange={(e) => setConcurrentRequests(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Requests: {totalRequests}
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={1000}
                    value={totalRequests}
                    onChange={(e) => setTotalRequests(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Interval (ms): {requestInterval}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={2000}
                    step={50}
                    value={requestInterval}
                    onChange={(e) => setRequestInterval(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🌡️ Temperature: {temperature}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Conservative (0.0)</span>
                    <span>Balanced (1.0)</span>
                    <span>Creative (2.0)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📝 Max Tokens: {maxTokens}
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={1000}
                    step={50}
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Short (50)</span>
                    <span>Medium (500)</span>
                    <span>Long (1000)</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={runLoadTest}
                    disabled={isRunning}
                    className={`relative flex-1 overflow-hidden bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-300 ${
                      isRunning 
                        ? '' 
                        : 'hover:scale-105 hover:shadow-lg active:scale-95'
                    }`}
                  >
                    {/* Progress bar background */}
                    {isRunning && (
                      <div 
                        className="absolute inset-0 bg-blue-800 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                    
                    {/* Button content */}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isRunning ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Running... {Math.round(progress)}%
                        </>
                      ) : (
                        '🚀 Start Load Test'
                      )}
                    </span>
                  </button>
                  
                  {isRunning && (
                    <button
                      onClick={stopTest}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-all duration-200 hover:scale-105"
                    >
                      ⏹️ Stop
                    </button>
                  )}
                </div>

                <button
                  onClick={clearResults}
                  disabled={isRunning}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 font-medium transition-all duration-200 hover:scale-105"
                >
                  🗑️ Clear Results
                </button>
              </div>
            </div>

            {/* Statistics Panel - Always visible */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">📊 Test Statistics</h2>
              {stats ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Total Requests</div>
                    <div className="font-semibold text-gray-900">{stats.totalRequests}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Success Rate</div>
                    <div className="font-semibold text-green-600">
                      {((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Avg TTFT</div>
                    <div className="font-semibold text-blue-600">{stats.averageTTFT.toFixed(0)}ms</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Avg Total Latency</div>
                    <div className="font-semibold text-gray-900">{stats.averageLatency.toFixed(0)}ms</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Min/Max TTFT</div>
                    <div className="font-semibold text-blue-600">
                      {stats.minTTFT.toFixed(0)}ms / {stats.maxTTFT.toFixed(0)}ms
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Min/Max Latency</div>
                    <div className="font-semibold text-gray-900">
                      {stats.minLatency.toFixed(0)}ms / {stats.maxLatency.toFixed(0)}ms
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Requests/sec</div>
                    <div className="font-semibold text-gray-900">{stats.requestsPerSecond.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Tokens/sec</div>
                    <div className="font-semibold text-purple-600">
                      {stats.averageTokensPerSecond ? stats.averageTokensPerSecond.toFixed(1) : 'N/A'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Total Requests</div>
                    <div className="font-semibold text-gray-400">N/A</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Success Rate</div>
                    <div className="font-semibold text-gray-400">N/A</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Avg TTFT</div>
                    <div className="font-semibold text-gray-400">N/A</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Avg Total Latency</div>
                    <div className="font-semibold text-gray-400">N/A</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Min/Max TTFT</div>
                    <div className="font-semibold text-gray-400">N/A</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Min/Max Latency</div>
                    <div className="font-semibold text-gray-400">N/A</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Requests/sec</div>
                    <div className="font-semibold text-gray-400">N/A</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Tokens/sec</div>
                    <div className="font-semibold text-gray-400">N/A</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Real-time Results - Always Visible */}
            <div className="bg-white rounded-lg shadow h-fit">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">⚡ Real-time Test Results</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Live feed of API responses ({realtimeResults.length} results)
                </p>
              </div>
              
              <div className="h-272 overflow-y-auto">
                {realtimeResults.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No test results yet. Start a load test to see real-time results.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {realtimeResults.slice(-50).map((result) => (
                      <div key={result.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">#{result.id}</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              result.success 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {result.success ? '✅ Success' : '❌ Failed'}
                            </span>
                            {result.success && result.ttft > 0 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                TTFT: {result.ttft.toFixed(0)}ms
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex gap-2">
                            {result.success && result.tokensReceived && (
                              <span>📝 {result.tokensReceived} tokens</span>
                            )}
                            <span>⏱️ {result.duration.toFixed(0)}ms</span>
                          </div>
                        </div>
                        
                        {/* Question - Always visible */}
                        <div className="text-sm text-gray-700 mb-2 bg-blue-50 p-2 rounded">
                          <strong>❓ Q:</strong> {result.question}
                        </div>
                        
                        {/* Answer - Collapsible */}
                        {result.success ? (
                          <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <strong>💬 A:</strong> {
                                  expandedAnswers.has(result.id) 
                                    ? result.response
                                    : `${result.response?.substring(0, 100)}${result.response && result.response.length > 100 ? '...' : ''}`
                                }
                              </div>
                              {result.response && result.response.length > 100 && (
                                <button
                                  onClick={() => toggleAnswerExpansion(result.id)}
                                  className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0 transition-colors duration-150"
                                >
                                  <svg 
                                    className={`w-4 h-4 transition-transform duration-200 ${expandedAnswers.has(result.id) ? 'rotate-180' : ''}`}
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            <strong>⚠️ Error:</strong> {result.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Monitoring Dashboard - Moved to bottom */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">📈 Monitoring Dashboard</h2>
            <GrafanaDashboard />
          </div>
        </div>
      </div>

      {/* Questions Modal */}
      {showQuestionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">📚 Test Questions Library</h2>
                <button
                  onClick={() => setShowQuestionsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Browse all {testQuestions.length} curated questions used for diverse testing scenarios
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid gap-4">
                {testQuestions.map((question, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors duration-150">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                      <p className="text-sm text-gray-700 flex-1">{question}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowQuestionsModal(false)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium transition-all duration-200 hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
