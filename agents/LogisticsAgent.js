import { useState } from "react";

export function useLogisticsAgent() {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const runAgent = async (userMessage) => {
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a logistics AI agent for a quick-commerce dark store. 
            Help with inventory, routing, and delivery decisions. 
            User query: ${userMessage}`
          }]
        })
      });
      const data = await res.json();
      setResponse(data.content[0].text);
    } catch (err) {
      setResponse("Agent error: " + err.message);
    }
    setLoading(false);
  };

  return { runAgent, response, loading };
}