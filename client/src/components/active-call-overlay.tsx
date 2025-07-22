import { useState, useEffect } from 'react';
import { User, Mic, MicOff, Pause, Play, Phone, Share, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActiveCallOverlayProps {
  call: any;
  isMuted: boolean;
  isOnHold: boolean;
  onMute: () => void;
  onHold: () => void;
  onHangup: () => void;
  onConference: () => void;
}

export function ActiveCallOverlay({
  call,
  isMuted,
  isOnHold,
  onMute,
  onHold,
  onHangup,
  onConference,
}: ActiveCallOverlayProps) {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-softphone-panel border border-softphone-border rounded-2xl p-8 w-96 max-w-md">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-softphone-card rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="text-4xl text-softphone-text-secondary" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">
            {call?.params?.caller_id_name || 'Unknown Caller'}
          </h3>
          <p className="text-softphone-text-secondary font-mono">
            {call?.params?.caller_id_number || call?.destination_number || 'Unknown Number'}
          </p>
          <p className="text-lg font-medium mt-2">
            {isOnHold ? 'On Hold' : 'Connected'} - {formatDuration(duration)}
          </p>
        </div>

        {/* Call Controls */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Button
            onClick={onMute}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
              isMuted 
                ? 'bg-softphone-error hover:bg-red-600' 
                : 'bg-softphone-card hover:bg-softphone-border'
            }`}
          >
            {isMuted ? (
              <MicOff className="text-xl" />
            ) : (
              <Mic className="text-xl" />
            )}
          </Button>
          <Button
            onClick={onHold}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
              isOnHold 
                ? 'bg-softphone-warning hover:bg-yellow-600' 
                : 'bg-softphone-card hover:bg-softphone-border'
            }`}
          >
            {isOnHold ? (
              <Play className="text-xl" />
            ) : (
              <Pause className="text-xl" />
            )}
          </Button>
          <Button
            className="w-16 h-16 bg-softphone-card hover:bg-softphone-border rounded-full flex items-center justify-center transition-colors"
          >
            <Share className="text-xl" />
          </Button>
          <Button
            onClick={onHangup}
            className="w-16 h-16 bg-softphone-error hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
          >
            <Phone className="text-xl text-white transform rotate-135" />
          </Button>
        </div>

        {/* Conference Controls */}
        <div className="border-t border-softphone-border pt-6">
          <Button
            onClick={onConference}
            className="w-full bg-softphone-accent hover:bg-blue-600 rounded-lg py-3 font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add to Conference</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
