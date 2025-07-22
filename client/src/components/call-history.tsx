import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';
import type { CallLog } from '@shared/schema';

interface CallHistoryProps {
  onRedial: (phoneNumber: string) => void;
}

export function CallHistory({ onRedial }: CallHistoryProps) {
  const queryClient = useQueryClient();

  const { data: callLogs = [], isLoading } = useQuery<CallLog[]>({
    queryKey: ['/api/call-logs'],
  });

  const addCallLogMutation = useMutation({
    mutationFn: async (callLog: any) => {
      const response = await apiRequest('POST', '/api/call-logs', callLog);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/call-logs'] });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-softphone-success';
      case 'missed':
        return 'bg-softphone-warning';
      case 'failed':
        return 'bg-softphone-error';
      default:
        return 'bg-softphone-card';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-softphone-success';
      case 'missed':
        return 'text-softphone-warning';
      case 'failed':
        return 'text-softphone-error';
      default:
        return 'text-softphone-text-secondary';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-softphone-card border border-softphone-border rounded-lg p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-softphone-border rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-softphone-border rounded w-32 mb-2"></div>
                <div className="h-3 bg-softphone-border rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (callLogs.length === 0) {
    return (
      <div className="text-center py-12">
        <Phone className="w-12 h-12 text-softphone-text-secondary mx-auto mb-4" />
        <p className="text-softphone-text-secondary">No call history available</p>
        <p className="text-sm text-softphone-text-secondary mt-2">
          Your recent calls will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {callLogs.map((call) => (
        <div
          key={call.id}
          className="bg-softphone-card border border-softphone-border rounded-lg p-4 hover:bg-opacity-80 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${getStatusIcon(call.status)} rounded-full flex items-center justify-center`}>
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-softphone-text-primary">
                  {call.contactName || 'Unknown'}
                </p>
                <p className="text-softphone-text-secondary font-mono">
                  {call.phoneNumber}
                </p>
                <p className="text-xs text-softphone-text-secondary">
                  {formatDistanceToNow(new Date(call.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-softphone-text-primary">
                  {formatDuration(call.duration)}
                </p>
                <p className={`text-xs ${getStatusColor(call.status)} capitalize`}>
                  {call.status}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => onRedial(call.phoneNumber)}
                  className="w-8 h-8 bg-softphone-accent hover:bg-blue-600 p-0"
                >
                  <Phone className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-8 h-8 bg-softphone-border hover:bg-slate-500 border-softphone-border p-0"
                >
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
