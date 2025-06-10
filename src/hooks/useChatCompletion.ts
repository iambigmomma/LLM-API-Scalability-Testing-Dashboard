import { useState } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      content: string;
      role: 'assistant';
      [key: string]: any;
    };
    [key: string]: any;
  }>;
  created: number;
  model: string;
  [key: string]: any;
}

export function useChatCompletion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ChatCompletionResponse | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const sendChat = async (req: ChatCompletionRequest) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setDuration(null);
    const start = performance.now();
    try {
      const res = await fetch('http://165.227.40.179:8000/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResponse(data);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
      setDuration(performance.now() - start);
    }
  };

  return { sendChat, loading, error, response, duration };
} 