import React from "react";
import { Link } from "react-router-dom";
import { PhoneCall, ShieldCheck } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-[#EAE8E2] mt-16 text-[#606456]">
      {/* Sleek Emergency Helpline Bar */}
      <div className="bg-[#FAF9F6] border-b border-[#F1F1F0] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-[#111111]">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-medium">
              Medical Emergency Helpline: Immediate 24/7 assistance available
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:108"
              className="btn-kaira-dark !py-1.5 !px-4 text-[11px] flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Dial 108</span>
            </a>
            <Link
              to="/hospitals"
              className="btn-kaira-outline !py-1.5 !px-4 text-[11px]"
            >
              Find Care Near You
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area - Clean, Minimalist, Elegant */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-[#F1F1F0]">
          
          {/* Brand */}
          <div className="space-y-1.5 max-w-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-serif text-sm font-bold">
                M
              </div>
              <span className="font-serif text-xl tracking-wider text-[#111111]">
                MEDIASSIST
              </span>
            </div>
            <p className="text-xs text-[#8A8D83] leading-relaxed">
              AI-powered clinical decision support & medication recommendation system.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs uppercase tracking-wider font-medium text-[#4A4D45]">
            <Link to="/" className="hover:text-[#111111] transition-colors">
              Home
            </Link>
            <Link to="/interactions" className="hover:text-[#111111] transition-colors">
              Drug Interactions
            </Link>
            <Link to="/reminders" className="hover:text-[#111111] transition-colors">
              Reminders
            </Link>
            <Link to="/hospitals" className="hover:text-[#111111] transition-colors">
              Hospitals
            </Link>
            <Link to="/dashboard" className="hover:text-[#111111] transition-colors">
              Dashboard
            </Link>
            <Link to="/profile" className="hover:text-[#111111] transition-colors">
              Profile
            </Link>
          </nav>

        </div>

        {/* Crisp Medical Disclaimer */}
        <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#8A8D83]">
          <p className="max-w-2xl text-[11px] leading-relaxed">
            <strong className="text-[#4A4D45]">Medical Disclaimer:</strong> MediAssist provides informational guidance powered by clinical machine learning models. It does not replace professional medical advice, diagnosis, or treatment from a licensed physician.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#8C907E] font-medium flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted & Confidential</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Platform Info */}
      <div className="border-t border-[#F1F1F0] py-4 bg-[#FAF9F6] text-[11px] text-[#8A8D83]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>© {currentYear} MediAssist AI Healthcare. All rights reserved.</p>
          <p>Clinical Intelligence Platform</p>
        </div>
      </div>
    </footer>
  );
}
