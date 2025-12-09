import { Plus, MessageSquare, Settings, LogOut, Menu } from "lucide-react";
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
          "fixed lg:relative z-50 h-full bg-secondary/50 border-r border-border flex flex-col transition-all duration-300",
          isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:w-0 lg:translate-x-0"
        )}
      >
        <div className="flex-1 flex flex-col min-w-[256px]">
          {/* Header */}
          <div className="p-3 border-b border-border">
            <Button
              onClick={onNewChat}
              className="w-full justify-start gap-3 h-11 bg-transparent hover:bg-muted text-foreground border border-border"
              variant="outline"
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

          {/* Footer */}
          <div className="p-3 border-t border-border space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10 text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button
              variant="ghost"
              onClick={onLogout}
              className="w-full justify-start gap-3 h-10 text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </Button>
          </div>
        </div>
      </aside>

      {/* Toggle Button (always visible) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="fixed top-3 left-3 z-50 lg:absolute"
      >
        <Menu className="w-5 h-5" />
      </Button>
    </>
  );
};

export default AppSidebar;
