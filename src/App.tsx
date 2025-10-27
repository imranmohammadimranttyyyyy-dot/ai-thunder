import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import InstallPrompt from "./components/InstallPrompt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <InstallPrompt />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
import VoiceChat from "@/components/VoiceChat";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <VoiceChat />
    </div>
  );
}
import React, { useState } from "react";
import "./App.css";
import { startVoiceConversation, speakText } from "./integrations/voice";

function App() {
  const [messages, setMessages] = useState<string[]>([]);

  async function handleVoice() {
    startVoiceConversation(async (userSpeech) => {
      setMessages((prev) => [...prev, "🗣️ You: " + userSpeech]);

      // Ab yahan tumhara AI backend call hoga (Supabase/OpenAI)
      // Filhaal demo ke liye:
      const aiReply = "Hello! You said: " + userSpeech;

      setMessages((prev) => [...prev, "🤖 AI: " + aiReply]);
      speakText(aiReply); // AI ka jawab awaaz mein
    });
  }

  return (
    <div className="App">
      <h1>🎤 Loveable AI Voice Chat</h1>
      <button onClick={handleVoice}>Start Talking</button>
      <div>
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>
    </div>
  );
}

export default App;
