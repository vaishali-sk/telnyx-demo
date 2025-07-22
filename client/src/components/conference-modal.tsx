import { useState } from 'react';
import { X, User, MicOff, UserMinus, Crown, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ConferenceModalProps {
  onClose: () => void;
  onAddParticipant?: (phoneNumber: string) => void;
  onRemoveParticipant?: (callId: string) => void;
  onEndConference?: () => void;
}

interface Participant {
  id: string;
  name: string;
  number: string;
  isMuted: boolean;
  isHost: boolean;
}

export function ConferenceModal({ 
  onClose, 
  onAddParticipant, 
  onRemoveParticipant,
  onEndConference 
}: ConferenceModalProps) {
  const [newParticipantNumber, setNewParticipantNumber] = useState('');
  const [participants] = useState<Participant[]>([
    {
      id: '3',
      name: 'You',
      number: 'Host',
      isMuted: false,
      isHost: true,
    },
  ]);
  const { toast } = useToast();

  const handleAddParticipant = () => {
    if (newParticipantNumber.trim()) {
      if (onAddParticipant) {
        onAddParticipant(newParticipantNumber.trim());
        setNewParticipantNumber('');
        toast({
          title: "Adding Participant",
          description: `Calling ${newParticipantNumber.trim()}...`,
        });
      }
    }
  };

  const handleRemoveParticipant = (participantId: string) => {
    if (onRemoveParticipant) {
      onRemoveParticipant(participantId);
      toast({
        title: "Participant Removed",
        description: "Participant has been removed from the conference",
      });
    }
  };

  const handleEndConference = () => {
    if (onEndConference) {
      onEndConference();
      toast({
        title: "Conference Ended",
        description: "All participants have been disconnected",
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-softphone-panel border border-softphone-border rounded-2xl p-8 w-[500px] max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Conference Call</h2>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="w-8 h-8 bg-softphone-card hover:bg-softphone-border border-softphone-border p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Conference Participants */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Participants ({participants.length})</h3>
          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between bg-softphone-card border border-softphone-border rounded-lg p-3"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    participant.isHost ? 'bg-softphone-accent' : 'bg-softphone-success'
                  }`}>
                    <User className="text-white text-sm" />
                  </div>
                  <div>
                    <p className={`font-medium ${participant.isHost ? 'text-softphone-accent' : 'text-softphone-text-primary'}`}>
                      {participant.name}
                    </p>
                    <p className="text-xs text-softphone-text-secondary">
                      {participant.number}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {participant.isHost ? (
                    <div className="w-8 h-8 bg-softphone-card rounded-lg flex items-center justify-center">
                      <Crown className="text-softphone-warning text-sm" />
                    </div>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 bg-softphone-border hover:bg-slate-500 border-softphone-border p-0"
                      >
                        <MicOff className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveParticipant(participant.id)}
                        className="w-8 h-8 bg-softphone-error hover:bg-red-600 p-0"
                      >
                        <UserMinus className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Participant Form */}
        <div className="border-t border-softphone-border pt-6">
          <div className="flex space-x-2 mb-4">
            <Input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={newParticipantNumber}
              onChange={(e) => setNewParticipantNumber(e.target.value)}
              className="flex-1 bg-softphone-card border-softphone-border font-mono focus:ring-softphone-accent"
            />
            <Button
              onClick={handleAddParticipant}
              disabled={!newParticipantNumber.trim()}
              className="bg-softphone-accent hover:bg-blue-600 px-6"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          <Button
            onClick={handleEndConference}
            variant="destructive"
            className="w-full bg-softphone-error hover:bg-red-600"
          >
            End Conference
          </Button>
        </div>
      </div>
    </div>
  );
}
