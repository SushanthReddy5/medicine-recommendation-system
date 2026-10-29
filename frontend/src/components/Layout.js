import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Chatbot from "./Chatbot";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-premium">
      <Sidebar />
      <motion.main
        className="flex-1 overflow-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}>
        {children}
      </motion.main>
      <Chatbot />
    </div>
  );
}
