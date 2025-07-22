import { User, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IncomingCallModalProps {
  call: {
    id: string;
    callerName?: string;
    callerNumber?: string;
  };
  onAccept: () => void;
  onDecline: () => void;
}

export function IncomingCallModal({ call, onAccept, onDecline }: IncomingCallModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-softphone-panel border border-softphone-border rounded-2xl p-8 w-96 max-w-md animate-pulse">
        <div className="text-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-r from-softphone-accent to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Phone className="text-5xl text-white" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">
            {call.callerName || 'Unknown Caller'}
          </h3>
          <p className="text-softphone-text-secondary font-mono text-lg">
            {call.callerNumber || 'Unknown Number'}
          </p>
          <p className="text-lg font-medium mt-4 text-softphone-warning">
            Incoming Call...
          </p>
        </div>

        {/* Incoming Call Actions */}
        <div className="flex space-x-4">
          <Button
            onClick={onDecline}
            className="flex-1 bg-softphone-error hover:bg-red-600 rounded-xl py-4 font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <PhoneOff className="text-xl" />
            <span>Decline</span>
          </Button>
          <Button
            onClick={onAccept}
            className="flex-1 bg-softphone-success hover:bg-green-600 rounded-xl py-4 font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Phone className="text-xl" />
            <span>Accept</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
