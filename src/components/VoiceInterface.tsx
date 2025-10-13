import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff, Volume2, User } from 'lucide-react';

interface VoiceInterfaceProps {
  onSpeakingChange?: (speaking: boolean) => void;
}

const VoiceInterface = ({ onSpeakingChange }: VoiceInterfaceProps) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [userTranscript, setUserTranscript] = useState('');
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Received message:', event.type);
    
    if (event.type === 'response.audio.delta') {
      setIsAiSpeaking(true);
      onSpeakingChange?.(true);
    } else if (event.type === 'response.audio.done') {
      setIsAiSpeaking(false);
      onSpeakingChange?.(false);
    } else if (event.type === 'response.audio_transcript.delta') {
      setTranscript(prev => prev + (event.delta || ''));
    } else if (event.type === 'response.audio_transcript.done') {
      setTranscript(event.transcript || '');
    } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
      setUserTranscript(event.transcript || '');
    } else if (event.type === 'input_audio_buffer.speech_started') {
      setIsUserSpeaking(true);
    } else if (event.type === 'input_audio_buffer.speech_stopped') {
      setIsUserSpeaking(false);
    } else if (event.type === 'response.done') {
      // Clear transcripts after response is complete
      setTimeout(() => {
        setTranscript('');
        setUserTranscript('');
      }, 2000);
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
    <div className="relative">
      {/* Voice button */}
      {!isConnected ? (
        <Button 
          onClick={startConversation}
          disabled={isLoading}
          size="icon"
          variant="outline"
          className="h-14 w-14 rounded-2xl hover:scale-105 transition-transform"
        >
          <Mic className="h-5 w-5" />
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Button 
            onClick={endConversation}
            size="icon"
            variant="destructive"
            className="h-14 w-14 rounded-2xl relative"
          >
            {/* Animated rings when speaking */}
            {(isAiSpeaking || isUserSpeaking) && (
              <>
                <span className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" />
                <span className="absolute inset-0 rounded-2xl bg-primary/30 animate-pulse" />
              </>
            )}
            <MicOff className="h-5 w-5 relative z-10" />
          </Button>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2 text-xs">
            {isUserSpeaking && (
              <div className="flex items-center gap-1 text-primary animate-pulse">
                <User className="h-3 w-3" />
                <span>Aap bol rahe hain...</span>
              </div>
            )}
            {isAiSpeaking && (
              <div className="flex items-center gap-1 text-primary animate-pulse">
                <Volume2 className="h-3 w-3" />
                <span>AI bol raha hai...</span>
              </div>
            )}
            {!isUserSpeaking && !isAiSpeaking && (
              <span className="text-muted-foreground">Sunne ke liye taiyaar</span>
            )}
          </div>
        </div>
      )}

      {/* Transcript popup */}
      {isConnected && (userTranscript || transcript) && (
        <Card className="absolute bottom-20 right-0 w-80 max-w-[90vw] p-4 animate-fade-in shadow-lg">
          {userTranscript && (
            <div className="mb-3 pb-3 border-b">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Aap:</span>
              </div>
              <p className="text-sm">{userTranscript}</p>
            </div>
          )}
          {transcript && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Volume2 className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">AI:</span>
              </div>
              <p className="text-sm">{transcript}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default VoiceInterface;
