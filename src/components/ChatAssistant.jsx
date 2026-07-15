import { useState, useEffect, useRef } from "react";

/**
 * AI Chat Assistant Component
 * 
 * A conversational interface that helps users navigate the e-voting system.
 * Features:
 * - Context-aware responses based on current page
 * - Natural language questions about voting, elections, biometrics
 * - Quick action buttons for common tasks
 * - Knowledge base for system navigation
 */

// Knowledge base for the chatbot
const KNOWLEDGE_BASE = {
  greetings: [
    "Hello! I'm your CipherVote assistant. How can I help you with voting today?",
    "Hi there! Welcome to CipherVote. What would you like to know?",
    "Greetings! I'm here to help you with elections, voting, or biometric setup."
  ],
  
  voting: {
    questions: ["how to vote", "vote in election", "cast vote", "voting process", "can i vote"],
    answers: [
      "To vote, go to the Vote page and select an active election. You'll need to verify your face biometric first if you haven't already. After selecting a candidate, your vote is cryptographically hashed and added to the blockchain audit ledger. You'll receive a receipt you can use to verify your vote was counted!"
    ]
  },
  
  elections: {
    questions: ["create election", "elections", "election status", "active elections", "election results"],
    answers: [
      "To create an election, you need organization admin access. Go to the Elections tab in the organization dashboard. You can set candidates, dates, and share invitation codes with voters. Election results are updated in real-time!"
    ]
  },
  
  biometric: {
    questions: ["face verification", "biometric", "enroll face", "face setup", "biometric verification"],
    answers: [
      "Face verification adds an extra security layer. Go to Biometric Setup to register your face. You'll blink twice for liveness detection. Your face is converted to a 128-number mathematical vector (not stored as an image) and used to verify your identity before voting."
    ]
  },
  
  verification: {
    questions: ["verify vote", "check receipt", "audit log", "vote verification", "receipt verification"],
    answers: [
      "Use the Verify page to check if your vote was counted. Enter your receipt hash or scan your QR code. The public audit log shows the blockchain of all votes - anyone can verify vote integrity!"
    ]
  },
  
  security: {
    questions: ["security", "fraud", "hack", "tamper", "privacy"],
    answers: [
      "CipherVote uses military-grade security: SHA-256 cryptographic hashes, blockchain audit trails, multi-factor authentication, and real-time fraud detection. Your vote is completely private - no one can see who you voted for!"
    ]
  },
  
  technical: {
    questions: ["camera", "technical", "error", "troubleshoot", "fix"],
    answers: [
      "For camera issues: ensure you've granted camera permissions, check your internet connection, try a different browser, or refresh the page. For other errors, contact your election administrator."
    ]
  }
};

// Default responses when no match found
const DEFAULT_RESPONSES = [
  "I can help with that! You can ask about voting, creating elections, biometric setup, or verifying votes. What would you like to know?",
  "Let me see... I'm not sure about that specific question, but I can help you with voting, elections, security, or technical support. What do you need?",
  "That's an interesting question! I specialize in CipherVote features like voting, elections, biometrics, and verification. How can I assist?"
];

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentRoute, setCurrentRoute] = useState("");

  // Get current route
  useEffect(() => {
    setCurrentRoute(window.location.pathname);
  }, []);

  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = KNOWLEDGE_BASE.greetings[Math.floor(Math.random() * KNOWLEDGE_BASE.greetings.length)];
      setMessages([{ type: "bot", text: greeting }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getContextualHelp = () => {
    const routes = {
      "/vote": "You're on the Voting page. You can select active elections to vote in.",
      "/admin": "You're on the Admin dashboard. You can manage elections, view security events, and monitor fraud detection.",
      "/organization-dashboard": "You're on the Organization dashboard. You can create elections, manage members, and view analytics.",
      "/voter-portal": "You're on the Voter Portal. You can check your registration status and available elections.",
      "/biometric-enroll": "You're on the Biometric Setup page. This is where you register your face for secure voting.",
    };
    
    return routes[currentRoute] || "You're browsing the CipherVote platform. I can help you with voting, elections, or security questions.";
  };

  const generateResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    const contextHelp = getContextualHelp();

    // Check for greetings
    if (lowerMsg.match(/hello|hi|hey|greetings|good morning|good evening|good afternoon/)) {
      return [
        KNOWLEDGE_BASE.greetings[Math.floor(Math.random() * KNOWLEDGE_BASE.greetings.length)],
        contextHelp
      ].join(" ");
    }

    // Check voting questions
    for (const question of KNOWLEDGE_BASE.voting.questions) {
      if (lowerMsg.includes(question)) {
        return KNOWLEDGE_BASE.voting.answers[0];
      }
    }

    // Check elections questions
    for (const question of KNOWLEDGE_BASE.elections.questions) {
      if (lowerMsg.includes(question)) {
        return KNOWLEDGE_BASE.elections.answers[0];
      }
    }

    // Check biometric questions
    for (const question of KNOWLEDGE_BASE.biometric.questions) {
      if (lowerMsg.includes(question)) {
        return KNOWLEDGE_BASE.biometric.answers[0];
      }
    }

    // Check verification questions
    for (const question of KNOWLEDGE_BASE.verification.questions) {
      if (lowerMsg.includes(question)) {
        return KNOWLEDGE_BASE.verification.answers[0];
      }
    }

    // Check security questions
    for (const question of KNOWLEDGE_BASE.security.questions) {
      if (lowerMsg.includes(question)) {
        return KNOWLEDGE_BASE.security.answers[0];
      }
    }

    // Check technical questions
    for (const question of KNOWLEDGE_BASE.technical.questions) {
      if (lowerMsg.includes(question)) {
        return KNOWLEDGE_BASE.technical.answers[0];
      }
    }

    // Default response with context
    return `${DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)]} ${contextHelp}`;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText;
    setInputText("");
    setIsTyping(true);

    // Add user message
    setMessages(prev => [...prev, { type: "user", text: userMessage }]);

    // Simulate AI thinking time (for natural feel)
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));

    const botResponse = generateResponse(userMessage);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { type: "bot", text: botResponse }]);
  };

  const handleQuickAction = (action) => {
    const actions = {
      "vote": "/vote",
      "create election": "/election-workspace",
      "check vote": "/verify",
      "security settings": "/biometric-enroll",
      "admin panel": "/admin"
    };

    if (actions[action]) {
      window.location.href = actions[action];
      setMessages(prev => [...prev, { 
        type: "bot", 
        text: `I'll navigate you to the ${action} page.`, 
        actionTaken: true 
      }]);
    }
  };

  const quickActions = [
    { label: "Vote", action: "vote", icon: "🗳️" },
    { label: "Create Election", action: "create election", icon: "📅" },
    { label: "Check Vote", action: "check vote", icon: "🔍" },
    { label: "Security", action: "security settings", icon: "🔐" },
  ];

  return (
    <div className="chat-assistant-container">
      {/* Chat Toggle Button */}
      <button 
        className="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? "✕" : "💬"}
        {messages.length > 1 && messages[messages.length - 1].type === "bot" && (
          <span className="chat-badge">New</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-content">
              <span className="chat-icon">🤖</span>
              <div>
                <h3>CipherVote Assistant</h3>
                <p className="chat-subtitle">AI-powered help for elections</p>
              </div>
            </div>
            <button 
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`chat-message ${msg.type === "user" ? "user-message" : "bot-message"}`}
              >
                {msg.type === "bot" && <span className="message-icon">🤖</span>}
                <div className="message-content">{msg.text}</div>
                {msg.type === "bot" && <span className="message-icon">🤖</span>}
              </div>
            ))}
            
            {isTyping && (
              <div className="chat-message bot-message">
                <span className="message-icon">🤖</span>
                <div className="message-content typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="chat-quick-actions">
            {quickActions.map((action) => (
              <button
                key={action.action}
                className="quick-action-btn"
                onClick={() => handleQuickAction(action.action)}
                aria-label={action.action}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about voting, elections, or security..."
              className="chat-input"
              aria-label="Chat message"
            />
            <button 
              onClick={handleSendMessage}
              className="chat-send-btn"
              aria-label="Send message"
              disabled={!inputText.trim()}
            >
              ➤
            </button>
          </div>

          {/* Context Info */}
          <div className="chat-context">
            <span className="context-icon">📍</span>
            <span className="context-text">
              {currentRoute === "/vote" && "Voting Portal"}
              {currentRoute === "/admin" && "Admin Dashboard"}
              {currentRoute === "/organization-dashboard" && "Organization Dashboard"}
              {currentRoute === "/voter-portal" && "Voter Portal"}
              {currentRoute === "/biometric-enroll" && "Biometric Setup"}
              {currentRoute === "/" && "Home"}
              {!["/vote", "/admin", "/organization-dashboard", "/voter-portal", "/biometric-enroll", "/"].includes(currentRoute) && "Browsing"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;
