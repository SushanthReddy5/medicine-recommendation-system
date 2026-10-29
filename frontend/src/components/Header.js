import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Activity, 
  Pill, 
  Clock, 
  MapPin, 
  BarChart3, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  ShieldCheck
} from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/", icon: Activity },
    { name: "Drug Interactions", path: "/interactions", icon: Pill },
    { name: "Reminders", path: "/reminders", icon: Clock },
    { name: "Hospitals", path: "/hospitals", icon: MapPin },
    { name: "Dashboard", path: "/dashboard", icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE8E2] transition-all">
      {/* Top Banner Bar */}
      <div className="bg-[#111111] text-[#E5E3DC] py-2 px-4 text-xs font-medium tracking-wider uppercase border-b border-[#222]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#8C907E] animate-pulse"></span>
            <span>Clinical AI Healthcare & Medicine Recommendation Platform</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[#A8A59C]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8C907E]" /> ML Model Active
            </span>
            <span className="border-l border-white/20 pl-4">Always consult a qualified medical professional</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo in Kaira's signature Marcellus Typography */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-serif text-lg font-bold group-hover:bg-[#8C907E] transition-colors">
              M
            </div>
            <div>
              <span className="font-serif text-2xl tracking-wider text-[#111111] block leading-none">
                MEDIASSIST
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#8A8D83] block mt-1 font-medium">
                Clinical Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-200 relative ${
                    active
                      ? "text-[#111111] font-semibold"
                      : "text-[#606456] hover:text-[#111111]"
                  }`}
                >
                  {item.name}
                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#8C907E]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Account / Actions */}
          <div className="hidden sm:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-full border border-[#EAE8E2] hover:border-[#8C907E] bg-[#F8F7F4] hover:bg-white transition-all text-xs font-medium uppercase tracking-wider text-[#111111]"
                >
                  <div className="w-6 h-6 rounded-full bg-[#8C907E] text-white flex items-center justify-center text-xs font-semibold">
                    {user.avatar && user.avatar_type === "emoji" ? (
                      user.avatar
                    ) : (
                      user.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name?.split(" ")[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8A8D83]" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-[#EAE8E2] rounded-lg shadow-kaira-dropdown py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-[#F1F1F0]">
                      <p className="text-xs font-semibold text-[#111111] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#8A8D83] truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#4A4D45] hover:text-[#111111] hover:bg-[#F8F7F4] tracking-wide"
                    >
                      <User className="w-4 h-4 text-[#8C907E]" />
                      <span>My Profile & Health</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#4A4D45] hover:text-[#111111] hover:bg-[#F8F7F4] tracking-wide"
                    >
                      <BarChart3 className="w-4 h-4 text-[#8C907E]" />
                      <span>Health Dashboard</span>
                    </Link>

                    <div className="border-t border-[#F1F1F0] my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 tracking-wide text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs font-medium uppercase tracking-[0.12em] text-[#111111] hover:text-[#8C907E] px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-kaira-dark text-xs !py-2 !px-4"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Quick Action button */}
            <Link
              to="/"
              onClick={() => {
                const el = document.getElementById("symptom-checker");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-kaira-dark text-xs !py-2 !px-4"
            >
              Check Symptoms
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#111111] hover:text-[#8C907E] transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Offcanvas Navigation (Kaira Style) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl p-6 flex flex-col justify-between border-l border-[#EAE8E2] animate-slide-up">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#EAE8E2]">
                <span className="font-serif text-xl tracking-wider text-[#111111]">
                  MENU
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#8A8D83] hover:text-[#111111]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="mt-6 space-y-1">
                {navLinks.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 text-sm font-medium uppercase tracking-[0.1em] rounded-md transition-colors ${
                        active
                          ? "bg-[#F8F7F4] text-[#111111] font-semibold border-l-2 border-[#8C907E]"
                          : "text-[#606456] hover:bg-[#F8F7F4] hover:text-[#111111]"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#8C907E]" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm font-medium uppercase tracking-[0.1em] text-[#606456] hover:bg-[#F8F7F4] hover:text-[#111111] rounded-md"
                >
                  <User className="w-4 h-4 text-[#8C907E]" />
                  <span>My Profile</span>
                </Link>
              </nav>
            </div>

            <div className="pt-6 border-t border-[#EAE8E2]">
              {user ? (
                <div>
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-[#111111]">{user.name}</p>
                    <p className="text-xs text-[#8A8D83]">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full btn-kaira-outline text-xs !py-2.5 flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full btn-kaira-outline text-xs !py-2.5 text-center block"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full btn-kaira-dark text-xs !py-2.5 text-center block"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
