"use client";
import React, { useState, useRef } from "react";
import { useChatCompletion, ChatMessage } from "../../hooks/useChatCompletion";

const API_URL = "/api/chat-completions";

export default function ChatDemo() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastRequest, setLastRequest] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 壓測相關 state
  const [benchCount, setBenchCount] = useState(10);
  const [benchRunning, setBenchRunning] = useState(false);
  const [benchSent, setBenchSent] = useState(0);
  const [benchSuccess, setBenchSuccess] = useState(0);
  const [benchFail, setBenchFail] = useState(0);
  const [benchLatencies, setBenchLatencies] = useState<number[]>([]);
  const benchAbortRef = useRef<{abort: boolean}>({abort: false});
  const [benchMode, setBenchMode] = useState<'sequential' | 'parallel'>('parallel');

  // 單次互動
  const handleSend = async () => {
    setError(null);
    if (!input.trim()) return;
    const newMessages = [
      ...messages,
      { role: "user" as const, content: input }
    ];
    setMessages(newMessages);
    setLastRequest({
      model: "deepseek-ai/DeepSeek-R1-Distill-Llama-8B",
      messages: [{ role: "user", content: input }], // 只送一個 user message
      stream: false,
      max_tokens: 300,
    });
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-ai/DeepSeek-R1-Distill-Llama-8B",
          messages: [{ role: "user", content: input }],
          stream: false,
          max_tokens: 300,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant" as const, content: data?.choices?.[0]?.message?.content || "(no response)" },
      ]);
    } catch (e: any) {
      setError(e.message || "Unknown error");
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant" as const, content: "(error)" },
      ]);
    }
    setInput("");
  };

  // 壓測功能
  const handleBenchmark = async () => {
    setError(null);
    setBenchRunning(true);
    setBenchSent(0);
    setBenchSuccess(0);
    setBenchFail(0);
    setBenchLatencies([]);
    benchAbortRef.current.abort = false;
    const req = {
      model: "deepseek-ai/DeepSeek-R1-Distill-Llama-8B",
      messages: [{ role: "user", content: "Hello, how are you?" }],
      stream: false,
      max_tokens: 300,
    };
    if (benchMode === 'sequential') {
      for (let i = 0; i < benchCount; ++i) {
        if (benchAbortRef.current.abort) break;
        const t0 = performance.now();
        try {
          const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          await res.json();
          setBenchSuccess((s) => s + 1);
          setBenchLatencies((arr) => [...arr, performance.now() - t0]);
        } catch {
          setBenchFail((f) => f + 1);
        }
        setBenchSent((n) => n + 1);
      }
    } else {
      // parallel
      const promises: Promise<void>[] = [];
      const start = performance.now();
      for (let i = 0; i < benchCount; ++i) {
        promises.push(
          (async () => {
            const t0 = performance.now();
            try {
              const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(req),
              });
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              await res.json();
              setBenchSuccess((s) => s + 1);
              setBenchLatencies((arr) => [...arr, performance.now() - t0]);
            } catch {
              setBenchFail((f) => f + 1);
            }
            setBenchSent((n) => n + 1);
          })()
        );
      }
      await Promise.all(promises);
    }
    setBenchRunning(false);
  };

  const handleStopBenchmark = () => {
    benchAbortRef.current.abort = true;
    setBenchRunning(false);
  };

  const avgLatency = benchLatencies.length
    ? benchLatencies.reduce((a, b) => a + b, 0) / benchLatencies.length
    : 0;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 24, background: "#fff", border: "1px solid #ccc", borderRadius: 12, color: "#222" }}>
      <h2 style={{ color: "#222", fontWeight: 700 }}>Chat Completion Demo & Performance Dashboard</h2>
      <div style={{ marginBottom: 32, padding: 16, background: "#f4f6fa", borderRadius: 8, border: "1px solid #e0e0e0" }}>
        <h3 style={{ color: "#222" }}>壓測效能 (Benchmark)</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <label style={{ color: "#222" }}>Request 數量：</label>
          <input
            type="number"
            min={1}
            max={1000}
            value={benchCount}
            onChange={e => setBenchCount(Number(e.target.value))}
            disabled={benchRunning}
            style={{ width: 80, border: "1px solid #aaa", borderRadius: 4, padding: 4, color: "#222", background: "#fff" }}
          />
          <select value={benchMode} onChange={e => setBenchMode(e.target.value as any)} disabled={benchRunning} style={{ padding: 4, borderRadius: 4, border: "1px solid #aaa" }}>
            <option value="parallel">併發 Parallel</option>
            <option value="sequential">同步 Sequential</option>
          </select>
          <button onClick={handleBenchmark} disabled={benchRunning} style={{ padding: "6px 16px", background: "#1976d2", color: "#fff", border: "none", borderRadius: 4 }}>開始壓測</button>
          <button onClick={handleStopBenchmark} disabled={!benchRunning} style={{ padding: "6px 16px", background: "#aaa", color: "#fff", border: "none", borderRadius: 4 }}>停止</button>
        </div>
        <div style={{ fontSize: 15, color: "#222" }}>
          已發送: {benchSent} / {benchCount} &nbsp;|
          成功: <span style={{ color: "green" }}>{benchSuccess}</span> &nbsp;|
          失敗: <span style={{ color: "red" }}>{benchFail}</span> &nbsp;|
          平均 Latency: <b>{avgLatency.toFixed(1)} ms</b>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: "#888" }}>
          (每次壓測皆為同步發送，可依需求改成並發/批次)
        </div>
      </div>
      <div style={{ minHeight: 120, marginBottom: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.role === "user" ? "right" : "left", margin: "8px 0", color: msg.role === "user" ? "#222" : "#1976d2", fontWeight: msg.role === "user" ? 600 : 500 }}>
            <b>{msg.role === "user" ? "🧑‍💻 You" : "🤖 AI"}:</b> {msg.content}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 10, border: "1px solid #aaa", borderRadius: 4, color: "#222", background: "#fff" }}
          disabled={false}
        />
        <button onClick={handleSend} disabled={!input.trim()} style={{ padding: "8px 20px", background: "#1976d2", color: "#fff", border: "none", borderRadius: 4 }}>Send</button>
      </div>
      {error && <div style={{ color: "#c00", marginBottom: 8 }}>Error: {error}</div>}
      <details style={{ marginTop: 16 }}>
        <summary style={{ color: "#222", fontWeight: 600 }}>Debug Info</summary>
        <div>
          <b>Last Request:</b>
          <pre style={{ background: "#f8f8f8", padding: 8, color: "#222", borderRadius: 4, border: "1px solid #eee" }}>{JSON.stringify(lastRequest, null, 2)}</pre>
        </div>
      </details>
    </div>
  );
} 