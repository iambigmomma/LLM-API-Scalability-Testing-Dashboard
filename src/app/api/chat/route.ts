import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract configuration from request body
    const { config, ...requestBody } = body
    
    // Use configured endpoint and API key, with fallback to OpenAI
    const endpoint = config?.endpoint || 'https://api.openai.com/v1/chat/completions'
    const apiKey = config?.apiKey
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Add API key to headers if provided
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }
    
    // Forward the request to the configured LLM API endpoint
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: `Backend API error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    // Check if streaming is requested
    if (requestBody.stream) {
      // Return streaming response
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    } else {
      // Return regular JSON response
      const data = await response.json()
      return NextResponse.json(data, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }
  } catch (error: any) {
    console.error('Proxy API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 