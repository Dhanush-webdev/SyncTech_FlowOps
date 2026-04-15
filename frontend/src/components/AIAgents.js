import { useState } from "react";

export default function AIAgent() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const askAgent = async () => {
    setLoading(true);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-allow-browser": "true"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [{ role: "user", content: `You are a logistics AI agent for a quick-commerce dark store operations platform. Answer this: ${query}` }]
      })
    });
    const data = await res.json();
    setResponse(data.content[0].text);
    setLoading(false);
  };

  return (
    <div style={{padding:"20px", border:"2px solid #6366f1", borderRadius:"12px", margin:"20px"}}>
      <h2>🤖 AI Logistics Agent</h2>
      <textarea
        rows={3}
        style={{width:"100%", padding:"10px"}}
        placeholder="Ask about inventory, routing, delivery..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <button
        onClick={askAgent}
        style={{background:"#6366f1", color:"white", padding:"10px 20px", border:"none", borderRadius:"8px", cursor:"pointer", marginTop:"10px"}}
      >
        {loading ? "Thinking..." : "Ask Agent"}
      </button>
      {response && (
        <div style={{marginTop:"15px", padding:"15px", background:"#f0f9ff", borderRadius:"8px"}}>
          <strong>Agent Response:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}