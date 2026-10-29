import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Heart, PhoneCall } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#EAE8E2] mt-20 text-[#4A4D45]">
      {/* Upper Footer: Newsletter / Emergency Notice */}
      <div className="border-b border-[#F1F1F0] py-10 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#8C907E]/15 flex items-center justify-center text-[#8C907E]">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg text-[#111111]">
                  Experiencing an acute medical emergency?
                </h4>
                <p className="text-xs text-[#8A8D83] mt-0.5">
                  Call emergency services immediately or visit the nearest emergency medical facility.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="tel:108"
                className="btn-kaira-dark text-xs !py-2.5 !px-5 flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Emergency (108)</span>
              </a>
              <Link
                to="/hospitals"
                className="btn-kaira-outline text-xs !py-2.5 !px-5"
              >
                Locate Nearby Care
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Intro */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-serif text-sm font-bold">
                M
              </div>
              <span className="font-serif text-xl tracking-wider text-[#111111]">
                MEDIASSIST
              </span>
            </div>
            <p className="text-xs text-[#606456] leading-relaxed">
              MediAssist is an intelligent clinical decision support platform designed to assist patients and healthcare practitioners with AI-driven symptom evaluation, drug-to-drug interaction safety, and medication schedule tracking.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#8C907E] font-medium tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#8C907E]"></span>
              <span>Machine Learning Diagnostic Model</span>
            </div>
          </div>

          {/* Clinical Features */}
          <div>
            <h5 className="font-serif text-sm uppercase tracking-[0.15em] text-[#111111] mb-5">
              Clinical Services
            </h5>
            <ul className="space-y-2.5 text-xs tracking-wide">
              <li>
                <Link to="/" className="text-[#606456] hover:text-[#111111] transition-colors">
                  Symptom Diagnostic Studio
                </Link>
              </li>
              <li>
                <Link to="/interactions" className="text-[#606456] hover:text-[#111111] transition-colors">
                  Drug Interaction Checker
                </Link>
              </li>
              <li>
                <Link to="/reminders" className="text-[#606456] hover:text-[#111111] transition-colors">
                  Medication Dose Reminders
                </Link>
              </li>
              <li>
                <Link to="/hospitals" className="text-[#606456] hover:text-[#111111] transition-colors">
                  Verified Hospitals & Pharmacies
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-[#606456] hover:text-[#111111] transition-colors">
                  Health Analytics & Trends
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Compliance */}
          <div>
            <h5 className="font-serif text-sm uppercase tracking-[0.15em] text-[#111111] mb-5">
              Medical Standards
            </h5>
            <ul className="space-y-2.5 text-xs text-[#606456] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#8C907E] font-bold">✓</span>
                <span>Evidence-based clinical disease modeling</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8C907E] font-bold">✓</span>
                <span>Precautionary adverse interaction detection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8C907E] font-bold">✓</span>
                <span>Personalized patient allergy safeguarding</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8C907E] font-bold">✓</span>
                <span>OpenStreetMap verified medical geography</span>
              </li>
            </ul>
          </div>

          {/* Medical Disclaimer */}
          <div>
            <h5 className="font-serif text-sm uppercase tracking-[0.15em] text-[#111111] mb-5">
              Clinical Disclaimer
            </h5>
            <div className="bg-[#F8F7F4] border border-[#EAE8E2] p-4 rounded-sm text-[11px] text-[#606456] leading-relaxed">
              <p className="font-semibold text-[#111111] mb-1">
                Informational Purposes Only
              </p>
              MediAssist recommendations do not constitute formal medical diagnosis or prescription. Always consult a board-certified physician before initiating, modifying, or terminating medication regimens.
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar / Legal & Attribution */}
      <div className="border-t border-[#F1F1F0] py-6 text-xs text-[#8A8D83]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} MediAssist AI Healthcare. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Template Design: <a href="https://templatesjungle.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#111111]">TemplatesJungle</a></span>
            <span className="border-l border-[#EAE8E2] pl-6 flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-[#8C907E] fill-[#8C907E]" /> for patient safety
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
