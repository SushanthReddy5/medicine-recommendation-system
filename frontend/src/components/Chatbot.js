import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { MessageSquare, X, Send, Bot, AlertTriangle } from "lucide-react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

const SUGGESTED = [
  "What are common side effects of Ibuprofen?",
  "What home care is advised for viral fever?",
  "Is Paracetamol safe with slight hypertension?",
  "What foods should be avoided with acid reflux?",
];

export default function Chatbot() {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello${
        user ? ` ${user.name.split(" ")[0]}` : ""
      }! I am the MediAssist Clinical AI assistant. How may I assist your medical inquiries today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: newMessages,
          user_profile: user
            ? {
                name: user.name,
                age: user.age,
                gender: user.gender,
                blood_group: user.blood_group,
                allergies: user.allergies,
              }
            : null,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "I am currently unable to process that clinical inquiry. Please try again.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connection error. Please verify server connectivity and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#111111] hover:bg-[#8C907E] text-white flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105"
        aria-label="Open AI Healthcare Assistant"
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[540px] bg-white border border-[#EAE8E2] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          
          {/* Header */}
          <div className="bg-[#111111] text-white px-5 py-4 flex items-center justify-between border-b border-[#222]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#8C907E] text-white flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base tracking-wide text-white leading-tight">
                  MediAssist Clinical AI
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-wider text-[#D3D7C9]">
                    Online Assistant
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[#A8A59C] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Allergy warning banner if user profile has allergies */}
          {user?.allergies && user.allergies.toLowerCase() !== "none" && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs text-amber-900">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span className="truncate">
                Patient Allergy: <strong>{user.allergies}</strong>
              </span>
            </div>
          )}

          {/* Conversation Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF9F6]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#111111] text-white"
                      : "bg-white border border-[#EAE8E2] text-[#4A4D45] shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#EAE8E2] p-3 text-xs text-[#8A8D83] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#8C907E] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#8C907E] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#8C907E] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {messages.length === 1 && !loading && (
              <div className="pt-2 space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-[#8A8D83] text-center font-medium">
                  Frequently Inquired:
                </p>
                {SUGGESTED.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="w-full text-left text-xs p-2.5 bg-white border border-[#EAE8E2] hover:border-[#8C907E] text-[#606456] hover:text-[#111111] transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-[#EAE8E2] flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Inquire about symptoms, doses, or precautions..."
              disabled={loading}
              className="flex-1 bg-[#FAF9F6] border border-[#EAE8E2] focus:border-[#111111] px-3.5 py-2.5 text-xs text-[#111111] placeholder-[#A8A59C] outline-none"
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="btn-kaira-dark !p-2.5 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
