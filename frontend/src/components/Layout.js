import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Chatbot from "./Chatbot";
import ReminderNotifier from "./ReminderNotifier";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#4A4D45]">
      {/* Global Clinical Reminder Alerts & Audio Engine */}
      <ReminderNotifier />

      {/* Kaira Header Navigation */}
      <Header />

      {/* Main Page Content */}
      <main className="flex-1 w-full animate-fade-in">
        {children}
      </main>

      {/* Kaira Multi-Column Footer */}
      <Footer />

      {/* Floating Kaira Medical AI Assistant */}
      <Chatbot />
    </div>
  );
}
