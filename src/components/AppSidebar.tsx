import { Plus, MessageSquare, Settings, LogOut, Menu, Sparkles, Zap, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatHistory {
  id: string;
  title: string;
  active?: boolean;
}

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chatHistory: ChatHistory[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onLogout: () => void;
}

const AppSidebar = ({
  isOpen,
  onToggle,
  chatHistory,
  onNewChat,
  onSelectChat,
  onLogout,
}: AppSidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative z-50 h-full bg-secondary border-r border-border flex flex-col transition-all duration-300 overflow-hidden",
          isOpen ? "w-64" : "w-0"
        )}
      >
        <div className="flex-1 flex flex-col w-64">
          {/* Header */}
          <div className="p-3 border-b border-border/50 pt-14">
            <Button
              onClick={onNewChat}
              className="w-full justify-start gap-3 h-10 bg-primary/10 hover:bg-primary/20 text-foreground border-0"
              variant="ghost"
            >
              <Plus className="w-4 h-4" />
              New chat
            </Button>
          </div>

          {/* Chat History */}
          <ScrollArea className="flex-1 px-2 py-3">
            <div className="space-y-1">
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground">Today</p>
              {chatHistory.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">No chats yet</p>
              ) : (
                chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 transition-colors",
                      chat.active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{chat.title}</span>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Features Section */}
          <div className="px-2 py-3 border-t border-border/50">
            <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">Features</p>
            <div className="space-y-0.5 mt-1">
              <div className="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground/80">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
                <span>Advanced AI</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground/80">
                <div className="w-6 h-6 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-yellow-500" />
                </div>
                <span>Lightning Fast</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-md text-xs text-muted-foreground/80">
                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Shield className="w-3 h-3 text-green-500" />
                </div>
                <span>Private & Secure</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border/50 space-y-0.5">
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Toggle Button (always visible) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className={cn(
          "fixed top-3 z-[60] bg-background/90 backdrop-blur-sm border border-border/50 shadow-sm hover:bg-muted transition-all duration-300",
          isOpen ? "left-[220px]" : "left-3"
        )}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>
    </>
  );
};

export default AppSidebar;
