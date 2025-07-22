import { useState, useEffect, useCallback } from 'react';
import { TelnyxClient, type CallEvent } from '@/lib/telnyx-client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import type { Settings } from '@shared/schema';

export interface CallState {
  isConnected: boolean;
  activeCall: any;
  callStatus: 'idle' | 'connecting' | 'ringing' | 'connected' | 'ended';
  isMuted: boolean;
  isOnHold: boolean;
  incomingCall: any;
  callDuration: number;
}

export function useWebRTC() {
  const [client, setClient] = useState<TelnyxClient | null>(null);
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    activeCall: null,
    callStatus: 'idle',
    isMuted: false,
    isOnHold: false,
    incomingCall: null,
    callDuration: 0,
  });
  const { toast } = useToast();

  // Fetch settings to get API key
  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  // Auto-initialize client when settings are available
  useEffect(() => {
    if (settings && !client) {
      // Prefer SIP credentials over API key
      if (settings.sipUsername && settings.sipPassword) {
        const config = {
          username: settings.sipUsername,
          password: settings.sipPassword,
          debug: true
        };
        initializeClientWithConfig(config);
      } else if (settings.telnyxApiKey) {
        initializeClient(settings.telnyxApiKey);
      }
    }
  }, [settings, client]);

  const setupClientEventHandlers = useCallback((telnyxClient: TelnyxClient) => {
    telnyxClient.addEventListener((event: CallEvent) => {
      switch (event.type) {
        case 'incoming':
          setCallState(prev => ({
            ...prev,
            incomingCall: {
              id: event.callId,
              callerName: event.callerName,
              callerNumber: event.callerNumber,
            },
          }));
          break;
        case 'connecting':
          setCallState(prev => ({ ...prev, callStatus: 'connecting' }));
          break;
        case 'connected':
          setCallState(prev => ({
            ...prev,
            callStatus: 'connected',
            activeCall: telnyxClient.getActiveCall(),
            incomingCall: null,
          }));
          break;
        case 'ended':
          setCallState(prev => ({
            ...prev,
            callStatus: 'idle',
            activeCall: null,
            incomingCall: null,
            isMuted: false,
            isOnHold: false,
            callDuration: event.duration || 0,
          }));
          break;
        case 'failed':
          setCallState(prev => ({
            ...prev,
            callStatus: 'idle',
            activeCall: null,
            incomingCall: null,
          }));
          toast({
            title: "Call Failed",
            description: "Unable to establish the call",
            variant: "destructive",
          });
          break;
      }
    });
  }, [toast]);

  const initializeClient = useCallback(async (token: string) => {
    try {
      const telnyxClient = new TelnyxClient({ token, debug: true });
      setupClientEventHandlers(telnyxClient);

      await telnyxClient.connect();
      setClient(telnyxClient);
      setCallState(prev => ({ ...prev, isConnected: true }));
      
      toast({
        title: "Connected",
        description: "Successfully connected to Telnyx",
      });
    } catch (error) {
      console.error('Failed to initialize Telnyx client:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Telnyx WebRTC",
        variant: "destructive",
      });
    }
  }, [toast, setupClientEventHandlers]);

  const initializeClientWithConfig = useCallback(async (config: { username: string; password: string; debug?: boolean }) => {
    try {
      const telnyxClient = new TelnyxClient(config);
      setupClientEventHandlers(telnyxClient);

      await telnyxClient.connect();
      setClient(telnyxClient);
      setCallState(prev => ({ ...prev, isConnected: true }));
      
      toast({
        title: "Connected",
        description: "Successfully connected to Telnyx with SIP credentials",
      });
    } catch (error) {
      console.error('Failed to initialize Telnyx client with SIP credentials:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect with SIP credentials. Please check your username and password.",
        variant: "destructive",
      });
    }
  }, [toast, setupClientEventHandlers]);

  const makeCall = useCallback(async (phoneNumber: string) => {
    if (!client) {
      toast({
        title: "Not Connected",
        description: "Please configure Telnyx settings first",
        variant: "destructive",
      });
      return;
    }

    try {
      setCallState(prev => ({ ...prev, callStatus: 'connecting' }));
      await client.makeCall(phoneNumber);
    } catch (error) {
      console.error('Failed to make call:', error);
      setCallState(prev => ({ ...prev, callStatus: 'idle' }));
      toast({
        title: "Call Failed",
        description: "Unable to place the call",
        variant: "destructive",
      });
    }
  }, [client, toast]);

  const answerCall = useCallback(() => {
    if (client && callState.incomingCall) {
      client.answerCall();
    }
  }, [client, callState.incomingCall]);

  const hangupCall = useCallback(() => {
    if (client) {
      client.hangupCall();
    }
  }, [client]);

  const toggleMute = useCallback(() => {
    if (!client || !callState.activeCall) return;

    if (callState.isMuted) {
      client.unmuteCall();
    } else {
      client.muteCall();
    }
    setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, [client, callState.activeCall, callState.isMuted]);

  const toggleHold = useCallback(() => {
    if (!client || !callState.activeCall) return;

    if (callState.isOnHold) {
      client.unholdCall();
    } else {
      client.holdCall();
    }
    setCallState(prev => ({ ...prev, isOnHold: !prev.isOnHold }));
  }, [client, callState.activeCall, callState.isOnHold]);

  const transferCall = useCallback((destination: string) => {
    if (client && callState.activeCall) {
      client.transferCall(destination);
    }
  }, [client, callState.activeCall]);

  // Conference call methods
  const createConference = useCallback(() => {
    if (client && callState.activeCall) {
      return client.createConference();
    }
    return null;
  }, [client, callState.activeCall]);

  const addToConference = useCallback((phoneNumber: string) => {
    if (client) {
      return client.addToConference(phoneNumber);
    }
    return null;
  }, [client]);

  const removeFromConference = useCallback((callId: string) => {
    if (client) {
      client.removeFromConference(callId);
    }
  }, [client]);

  const endConference = useCallback(() => {
    if (client) {
      client.endConference();
    }
  }, [client]);

  const disconnect = useCallback(() => {
    if (client) {
      client.disconnect();
      setClient(null);
      setCallState({
        isConnected: false,
        activeCall: null,
        callStatus: 'idle',
        isMuted: false,
        isOnHold: false,
        incomingCall: null,
        callDuration: 0,
      });
    }
  }, [client]);

  return {
    callState,
    initializeClient,
    makeCall,
    answerCall,
    hangupCall,
    toggleMute,
    toggleHold,
    transferCall,
    createConference,
    addToConference,
    removeFromConference,
    endConference,
    disconnect,
  };
}
