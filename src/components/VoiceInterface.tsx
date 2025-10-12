import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInterfaceProps {
  onSpeakingChange?: (speaking: boolean) => void;
}

const VoiceInterface = ({ onSpeakingChange }: VoiceInterfaceProps) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Received message:', event.type);
    
    if (event.type === 'response.audio.delta') {
      onSpeakingChange?.(true);
    } else if (event.type === 'response.audio.done') {
      onSpeakingChange?.(false);
    }
  };

  const startConversation = async () => {
    setIsLoading(true);
    try {
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      setIsConnected(true);
      
      toast({
        title: "Voice chat shuru ho gaya",
        description: "Ab aap bol sakte hain",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Voice chat shuru nahi ho saka',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    onSpeakingChange?.(false);
    
    toast({
      title: "Voice chat band ho gaya",
    });
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      {!isConnected ? (
        <Button 
          onClick={startConversation}
          disabled={isLoading}
          size="icon"
          variant="outline"
          className="h-14 w-14 rounded-2xl"
        >
          <Mic className="h-5 w-5" />
        </Button>
      ) : (
        <Button 
          onClick={endConversation}
          size="icon"
          variant="destructive"
          className="h-14 w-14 rounded-2xl animate-pulse"
        >
          <MicOff className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default VoiceInterface;
