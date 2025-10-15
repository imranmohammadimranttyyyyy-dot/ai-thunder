import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { streamChat } from "@/utils/chatStream";
import VoiceInterface from "@/components/VoiceInterface";
import OnlineUsersCounter from "@/components/OnlineUsersCounter";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMessage],
        onDelta: updateAssistant,
        onDone: () => setIsLoading(false),
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Chat error:", error);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-primary animate-pulse" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              chat.AI
            </h1>
          </div>
          <div className="flex-1 flex justify-end">
            <OnlineUsersCounter />
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-20 animate-fade-in">
              <div className="rounded-full bg-primary/10 p-4">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-3xl font-semibold">
                How can I help you today?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                <button className="p-4 rounded-xl bg-background border border-border hover:bg-accent transition-colors text-left">
                  <p className="font-medium text-sm">Create a plan</p>
                  <p className="text-xs text-muted-foreground mt-1">for a trip to explore the Alps in Switzerland</p>
                </button>
                <button className="p-4 rounded-xl bg-background border border-border hover:bg-accent transition-colors text-left">
                  <p className="font-medium text-sm">Give me ideas</p>
                  <p className="text-xs text-muted-foreground mt-1">for what to do with my kids' art</p>
                </button>
                <button className="p-4 rounded-xl bg-background border border-border hover:bg-accent transition-colors text-left">
                  <p className="font-medium text-sm">Help me debug</p>
                  <p className="text-xs text-muted-foreground mt-1">a Python script automating daily reports</p>
                </button>
                <button className="p-4 rounded-xl bg-background border border-border hover:bg-accent transition-colors text-left">
                  <p className="font-medium text-sm">Explain</p>
                  <p className="text-xs text-muted-foreground mt-1">nostalgia to a kindergartener</p>
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-6 animate-fade-in ${
                msg.role === "user" ? "flex justify-end" : ""
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto shadow-elegant"
                    : "bg-card border border-border shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="mb-6 animate-fade-in">
              <div className="max-w-[85%] rounded-2xl px-5 py-3 bg-card border border-border">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          <div className="flex gap-3 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Apna message likho..."
              className="min-h-[56px] max-h-32 resize-none rounded-2xl"
              disabled={isLoading}
            />
            <VoiceInterface />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-14 w-14 rounded-2xl shadow-elegant hover:shadow-glow transition-all"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
