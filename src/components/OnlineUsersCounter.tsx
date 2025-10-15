import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function OnlineUsersCounter() {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: Math.random().toString(36).substring(7),
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(count);
      })
      .on('presence', { event: 'join' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(count);
      })
      .on('presence', { event: 'leave' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
      <div className="relative">
        <Users className="h-4 w-4 text-primary" />
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
      </div>
      <span className="text-sm font-medium text-primary">
        {onlineCount} Online
      </span>
    </div>
  );
}
