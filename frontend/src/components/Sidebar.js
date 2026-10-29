import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const navigate         = useNavigate();
  const location         = useLocation();
  const { user, logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const NAV = [
    { path: "/",        icon: "🏠", label: "Home"    },
    { path: "/profile", icon: "👤", label: "Profile" },
  ];

  return (
    <aside className="flex flex-col w-56 flex-shrink-0 min-h-screen sticky top-0
                      border-r border-white/5"
           style={{ background: "rgba(10,10,26,0.8)", backdropFilter: "blur(20px)" }}>

      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/5
                      cursor-pointer" onClick={() => navigate("/")}>
        <motion.span className="text-2xl"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          ❤️‍🩹
        </motion.span>
        <div>
          <p className="text-white font-bold text-sm gradient-text">MediAssist</p>
          <p className="text-slate-500 text-xs">AI Healthcare</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                          transition-all duration-200 text-sm font-medium relative
                          ${isActive
                            ? "text-white"
                            : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r
                             from-blue-600/20 to-purple-600/10
                             border border-blue-500/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5
                                bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"/>
              )}
              <span className="text-lg relative z-10">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/5">
        {user && (
          <div className="flex items-center gap-2 px-2 py-2 mb-3
                          glass rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600
                            rounded-full flex items-center justify-center
                            text-sm font-bold text-white flex-shrink-0">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user.name}</p>
              <p className="text-slate-500 text-xs truncate">{user.email}</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!showLogout ? (
            <motion.button key="btn"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLogout(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                         text-slate-400 hover:text-red-400 hover:bg-red-500/10
                         transition-all duration-200 text-sm font-medium">
              <span className="text-lg">🚪</span>
              <span>Logout</span>
            </motion.button>
          ) : (
            <motion.div key="confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-red-300 text-xs mb-2 text-center">
                Sure you want to logout?
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowLogout(false)}
                        className="flex-1 text-xs glass text-slate-300 py-1.5
                                   rounded-lg hover:bg-white/10 transition-colors">
                  No
                </button>
                <button onClick={handleLogout}
                        className="flex-1 text-xs bg-red-600 hover:bg-red-500
                                   text-white font-bold py-1.5 rounded-lg transition-colors">
                  Yes
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
