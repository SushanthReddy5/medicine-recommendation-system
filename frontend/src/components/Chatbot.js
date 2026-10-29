import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

const SUGGESTED = [
  "What are side effects of Ibuprofen?",
  "What should I take for a cold?",
  "Is Paracetamol safe for children?",
  "What foods to avoid with acidity?",
];

export default function Chatbot() {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([{
    role   : "assistant",
    content: `Hi${user ? ` ${user.name.split(" ")[0]}` : ""}! I'm MediAssist AI 🤖 How can I help you today?`
  }]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const bottomRef             = useRef(null);

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
        method : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          messages: newMessages,
          user_profile: user ? {
            name: user.name, age: user.age,
            gender: user.gender, blood_group: user.blood_group,
            allergies: user.allergies,
          } : null,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply || "Sorry, try again."
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Connection error. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
                   bg-gradient-to-br from-blue-600 to-violet-600
                   text-white flex items-center justify-center
                   text-2xl shadow-glow-blue">
        {open ? "✕" : "💬"}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 16,    scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-96
                       max-w-[calc(100vw-2rem)] flex flex-col
                       rounded-2xl overflow-hidden border border-white/10
                       shadow-premium"
            style={{
              height: "520px",
              background: "rgba(10,10,26,0.92)",
              backdropFilter: "blur(24px)",
            }}>

            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3 border-b border-white/5
                            bg-gradient-to-r from-blue-600/15 to-purple-600/15">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600
                              rounded-full flex items-center justify-center text-lg
                              shadow-glow-blue flex-shrink-0">
                🤖
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">MediAssist AI</p>
                <div className="flex items-center gap-1.5">
                  <motion.span className="w-1.5 h-1.5 bg-green-400 rounded-full"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}/>
                  <p className="text-xs text-green-400">Online</p>
                </div>
              </div>
            </div>

            {/* Allergy badge */}
            {user?.allergies && user.allergies.toLowerCase() !== "none" && (
              <div className="bg-orange-500/10 border-b border-orange-500/20
                              px-4 py-1.5 flex items-center gap-2">
                <span className="text-orange-400 text-xs">⚠️</span>
                <p className="text-orange-300 text-xs truncate">
                  Allergy: <strong>{user.allergies}</strong>
                </p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm
                                   leading-relaxed whitespace-pre-wrap
                                   ${m.role === "user"
                                     ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm"
                                     : "bg-white/5 border border-white/10 text-slate-200 rounded-bl-sm"}`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing dots */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 rounded-2xl
                                    rounded-bl-sm px-4 py-3 flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.span key={i}
                          className="w-2 h-2 bg-blue-400 rounded-full block"
                          animate={{ y: [0, -5, 0] }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            delay: i * 0.12,
                            ease: "easeInOut"
                          }}/>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Suggestions */}
              {messages.length === 1 && !loading && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs text-slate-600 text-center">Suggested</p>
                  {SUGGESTED.map((q, i) => (
                    <motion.button key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => sendMessage(q)}
                      className="w-full text-left text-xs bg-white/5
                                 border border-white/5 hover:border-blue-500/30
                                 text-slate-400 hover:text-blue-400
                                 px-3 py-2 rounded-xl transition-all duration-150">
                      {q}
                    </motion.button>
                  ))}
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <div className="border-t border-white/5 px-3 py-3 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about symptoms or medicines..."
                disabled={loading}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl
                           px-3 py-2 text-sm text-slate-200 placeholder-slate-500
                           outline-none focus:border-blue-500/50 disabled:opacity-50
                           transition-colors duration-150"/>
              <motion.button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-blue-600 to-violet-600
                           text-white px-4 py-2 rounded-xl text-sm font-bold
                           disabled:opacity-40 disabled:cursor-not-allowed
                           shadow-glow-blue transition-opacity duration-150">
                →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
