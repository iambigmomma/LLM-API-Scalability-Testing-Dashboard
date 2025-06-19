import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      messages, 
      model = 'gpt-3.5-turbo', 
      max_tokens = 150, 
      temperature = 0.7, 
      stream = false,
      config 
    } = body

    // Use environment variable if no config provided
    const apiKey = config?.apiKey || process.env.DO_API_KEY || process.env.OPENAI_API_KEY
    const endpoint = config?.endpoint || 'https://api.openai.com/v1/chat/completions'

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found in configuration or environment variables' },
        { status: 401 }
      )
    }

    const requestBody = {
      model,
      messages,
      max_tokens,
      temperature,
      stream
    }

    console.log('Making API request to:', endpoint)
    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    console.log('API Response status:', response.status)
    console.log('API Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error response:', errorText)
      
      let errorMessage: string
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error?.message || errorJson.error || 'Unknown API error'
      } catch {
        errorMessage = `API request failed: ${response.status} ${response.statusText}`
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    if (stream) {
      // For streaming responses, pass through the stream
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // For non-streaming responses, parse and return JSON
      const data = await response.json()
      console.log('API Response data:', JSON.stringify(data, null, 2))
      return NextResponse.json(data)
    }

  } catch (error: unknown) {
    console.error('Chat API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 