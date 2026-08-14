import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Trash2 } from "lucide-react";
import { buildCopilotContext } from "../utils/copilotContext";
import { copilotEngine } from "../utils/copilotEngine";
import CopilotEvidence from "./CopilotEvidence";
import CopilotSuggestedActions from "./CopilotSuggestedActions";

export default function OperationsCopilot({
  telemetry = [],
  energyAssessment = null,
  healthAssessment = null,
  maintenanceAssessment = null,
  sustainabilityAssessment = null,
  alerts = []
}) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef(null);

  // Compile context on demand
  const getContext = () => {
    return buildCopilotContext({
      telemetry,
      energyAssessment,
      healthAssessment,
      maintenanceAssessment,
      sustainabilityAssessment,
      alerts
    });
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    const userMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);

    // Process using Copilot Engine
    const context = getContext();
    const result = copilotEngine.generateCopilotResponse(context, text);

    const assistantMessage = {
      role: "assistant",
      content: result.answer,
      evidence: result.evidence,
      recommendations: result.recommendations,
      confidence: result.confidence,
      dataAvailability: result.dataAvailability,
      timestamp: result.timestamp
    };

    // Minor timeout to feel conversational
    setTimeout(() => {
      setMessages((prev) => [...prev, assistantMessage]);
    }, 300);

    setInputValue("");
  };

  const handleQuickAction = (actionText) => {
    handleSendMessage(actionText);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const quickActions = [
    { label: "Equipment Status", prompt: "What is the current equipment status?" },
    { label: "Energy Summary", prompt: "How much energy has been consumed?" },
    { label: "Why is power changing?", prompt: "Why is power changing?" },
    { label: "Maintenance Recommendation", prompt: "What maintenance should I perform?" },
    { label: "Sustainability Status", prompt: "What is the sustainability status?" },
    { label: "Active Alerts", prompt: "Are there any active alerts?" },
    { label: "Data Quality", prompt: "What is the ESG data quality?" }
  ];

  const getConfidenceColorClass = (conf) => {
    switch (conf) {
      case "HIGH":
        return "text-normal font-bold";
      case "MEDIUM":
        return "text-warning font-semibold";
      case "LOW":
      default:
        return "text-critical font-semibold";
    }
  };

  return (
    <div className="panel operations-copilot-panel">
      <div className="panel-header border-b">
        <div>
          <h2>AI OPERATIONS COPILOT</h2>
          <p>Telemetry-grounded conversational diagnostic assistant</p>
        </div>
        <div className="copilot-header-actions">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="clear-chat-btn"
              title="Clear active conversation logs"
            >
              <Trash2 size={13} />
              <span>Clear chat</span>
            </button>
          )}
          <MessageSquare size={19} className="text-normal" />
        </div>
      </div>

      <div className="copilot-body">
        {/* Quick action chips list */}
        <div className="quick-actions-chips">
          {quickActions.map((chip, idx) => (
            <button
              key={idx}
              className="quick-chip-btn"
              onClick={() => handleQuickAction(chip.prompt)}
              title={`Ask: ${chip.prompt}`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Chat Logs Window */}
        <div className="copilot-chat-window">
          {messages.length === 0 ? (
            <div className="chat-empty-state">
              <Bot size={36} className="text-info" />
              <h3>Evidence-Grounded Operations Assistant</h3>
              <p>Ask about machine health status, power draws, alert causes, or sustainability configurations.</p>
            </div>
          ) : (
            <div className="messages-log">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-bubble-row ${msg.role}`}>
                  <div className="avatar">
                    {msg.role === "assistant" ? <Bot size={13} /> : <User size={13} />}
                  </div>
                  <div className="bubble-content">
                    <p className="msg-text">{msg.content}</p>

                    {/* Grounding metadata (Only for Assistant replies) */}
                    {msg.role === "assistant" && (
                      <>
                        <CopilotEvidence evidence={msg.evidence} />

                        <CopilotSuggestedActions recommendations={msg.recommendations} />

                        <div className="bubble-footer">
                          <span className="data-lbl">
                            Status: <strong className="font-semibold">{msg.dataAvailability}</strong>
                          </span>
                          <span className="dot-sep">•</span>
                          <span className="conf-lbl">
                            Confidence: <strong className={getConfidenceColorClass(msg.confidence)}>{msg.confidence}</strong>
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Text Form */}
        <form
          className="copilot-input-form border-t"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
        >
          <input
            type="text"
            className="copilot-input-field"
            placeholder="Ask about equipment, energy, maintenance or sustainability..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            aria-label="Operations copilot query input"
          />
          <button
            type="submit"
            className="copilot-submit-btn"
            disabled={!inputValue.trim()}
            title="Submit query to copilot"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
