import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Loader2, Sparkles, Code, Lightbulb, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { streamChat } from "@/utils/chatStream";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import AppSidebar from "./AppSidebar";
import { User } from "@supabase/supabase-js";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const FEATURE_CARDS = [
  {
    icon: Sparkles,
    title: "Creative Writing",
    description: "Stories, poems, scripts",
    prompt: "Help me write a creative short story about a time traveler",
  },
  {
    icon: Code,
    title: "Code Helper",
    description: "Debug, explain, optimize",
    prompt: "Explain how async/await works in JavaScript with examples",
  },
  {
    icon: Lightbulb,
    title: "Brainstorm Ideas",
    description: "Solutions & strategies",
    prompt: "Give me 5 unique startup ideas for 2024",
  },
];

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [chatHistory, setChatHistory] = useState<{ id: string; title: string; active?: boolean }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSend = async (customPrompt?: string) => {
    const messageText = customPrompt || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Add to chat history if first message
    if (messages.length === 0) {
      const title = messageText.slice(0, 30) + (messageText.length > 30 ? "..." : "");
      setChatHistory((prev) => [{ id: Date.now().toString(), title, active: true }, ...prev.map(c => ({ ...c, active: false }))]);
    }

    const allMessages = [...messages, userMessage];
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    await streamChat({
      messages: allMessages,
      onDelta: (delta) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === "assistant") {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: updated[lastIdx].content + delta,
            };
          }
          return updated;
        });
      },
      onDone: () => setIsLoading(false),
      onError: (error) => {
        console.error("Chat error:", error);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === "assistant") {
            updated[lastIdx] = { ...updated[lastIdx], content: "Sorry, something went wrong. Please try again." };
          }
          return updated;
        });
        setIsLoading(false);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatHistory((prev) => prev.map(c => ({ ...c, active: false })));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chatHistory={chatHistory}
        onNewChat={handleNewChat}
        onSelectChat={(id) => {
          setChatHistory((prev) => prev.map(c => ({ ...c, active: c.id === id })));
        }}
        onLogout={handleLogout}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-center px-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h1 className="font-semibold text-foreground">chat.AI</h1>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="max-w-3xl mx-auto px-4 py-8">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  How can I help you today?
                </h2>
                <p className="text-muted-foreground mb-10 max-w-md mx-auto">
                  I'm chat.AI, your intelligent assistant. Ask me anything or try one of these suggestions.
                </p>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  {FEATURE_CARDS.map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(card.prompt)}
                      className="group p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all text-left"
                    >
                      <card.icon className="w-6 h-6 text-primary mb-3" />
                      <h3 className="font-medium text-foreground mb-1">{card.title}</h3>
                      <p className="text-xs text-muted-foreground">{card.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex gap-4",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.content || (
                          <span className="inline-flex gap-1">
                            <span className="w-2 h-2 bg-current rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </span>
                        )}
                      </p>
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-secondary flex-shrink-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-secondary-foreground">
                          {user.email?.[0].toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-muted rounded-2xl p-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message chat.AI..."
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none border-0 bg-transparent focus-visible:ring-0 min-h-[44px] max-h-[200px] py-3 px-3"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-xl w-10 h-10 bg-primary hover:bg-primary/90 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-3">
              chat.AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
