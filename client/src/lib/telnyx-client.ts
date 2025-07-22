import { TelnyxRTC } from '@telnyx/webrtc';

export interface TelnyxConfig {
  token?: string;
  username?: string;
  password?: string;
  debug?: boolean;
}

export interface CallEvent {
  type: 'incoming' | 'connecting' | 'connected' | 'ended' | 'failed' | 'conference_created' | 'participant_joined' | 'participant_left';
  callId?: string;
  callerName?: string;
  callerNumber?: string;
  duration?: number;
  conferenceId?: string;
  participantNumber?: string;
}

export class TelnyxClient {
  private client: any;
  private activeCall: any = null;
  private eventListeners: ((event: CallEvent) => void)[] = [];
  private activeCalls: Map<string, any> = new Map();
  private activeConferenceId: string | null = null;

  constructor(config: TelnyxConfig) {
    let clientConfig: any = {
      debug: config.debug || false,
    };

    // Check if we have SIP credentials or token
    if (config.username && config.password) {
      // Use SIP credentials
      clientConfig = {
        ...clientConfig,
        login: config.username,
        passwd: config.password,
        realm: 'sip.telnyx.com',
        host: 'sip.telnyx.com'
      };
      console.log('Using SIP credentials for WebRTC connection');
    } else if (config.token) {
      // Use token-based authentication
      clientConfig = {
        ...clientConfig,
        login_token: config.token,
      };
      console.log('Using token for WebRTC connection');
    } else {
      throw new Error('Either SIP credentials (username/password) or token must be provided');
    }

    this.client = new TelnyxRTC(clientConfig);
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.client.on('telnyx.ready', () => {
      console.log('Telnyx WebRTC client is ready');
    });

    this.client.on('telnyx.error', (error: any) => {
      console.error('Telnyx error:', error);
      this.notifyListeners({ type: 'failed' });
    });

    this.client.on('call.received', (call: any) => {
      this.activeCall = call;
      this.notifyListeners({
        type: 'incoming',
        callId: call.id,
        callerName: call.params?.caller_id_name,
        callerNumber: call.params?.caller_id_number,
      });
    });

    this.client.on('call.state', (call: any) => {
      if (call.state === 'trying' || call.state === 'ringing') {
        this.notifyListeners({ 
          type: 'connecting',
          callId: call.id 
        });
      } else if (call.state === 'active') {
        this.notifyListeners({ 
          type: 'connected',
          callId: call.id 
        });
      } else if (call.state === 'destroy') {
        this.notifyListeners({ 
          type: 'ended',
          callId: call.id,
          duration: call.duration 
        });
        this.activeCall = null;
      }
    });
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Set up one-time listeners for connection result
      const onReady = () => {
        this.client.off('telnyx.ready', onReady);
        this.client.off('telnyx.error', onError);
        resolve();
      };
      
      const onError = (error: any) => {
        this.client.off('telnyx.ready', onReady);
        this.client.off('telnyx.error', onError);
        reject(new Error(`Telnyx connection failed: ${error.error?.message || 'Unknown error'}`));
      };
      
      this.client.on('telnyx.ready', onReady);
      this.client.on('telnyx.error', onError);
      
      // Initiate connection
      try {
        this.client.connect();
      } catch (error) {
        this.client.off('telnyx.ready', onReady);
        this.client.off('telnyx.error', onError);
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.client.disconnect();
  }

  makeCall(destination: string): Promise<any> {
    const call = this.client.newCall({
      destination_number: destination,
      caller_id_number: '', // Will be set by Telnyx
      caller_id_name: ''
    });
    
    this.activeCall = call;
    return call;
  }

  answerCall(): void {
    if (this.activeCall) {
      this.activeCall.answer();
    }
  }

  hangupCall(): void {
    if (this.activeCall) {
      this.activeCall.hangup();
      this.activeCall = null;
    }
  }

  muteCall(): void {
    if (this.activeCall) {
      this.activeCall.muteAudio();
    }
  }

  unmuteCall(): void {
    if (this.activeCall) {
      this.activeCall.unmuteAudio();
    }
  }

  holdCall(): void {
    if (this.activeCall) {
      this.activeCall.hold();
    }
  }

  unholdCall(): void {
    if (this.activeCall) {
      this.activeCall.unhold();
    }
  }

  transferCall(destination: string): void {
    if (this.activeCall) {
      this.activeCall.transfer(destination);
    }
  }

  // Conference call methods
  createConference(): string | null {
    if (!this.activeCall) return null;
    
    try {
      const conferenceId = `conf_${Date.now()}`;
      this.activeConferenceId = conferenceId;
      
      // Convert current call to conference
      this.activeCall.conference = true;
      this.activeCall.conferenceId = conferenceId;
      
      this.notifyListeners({
        type: 'conference_created',
        callId: this.activeCall.id,
        conferenceId: conferenceId
      });
      
      return conferenceId;
    } catch (error) {
      console.error('Failed to create conference:', error);
      return null;
    }
  }

  addToConference(phoneNumber: string): Promise<any> | null {
    if (!this.activeConferenceId) return null;
    
    try {
      const conferenceCall = this.client.newCall({
        destination_number: phoneNumber,
        caller_id_number: '',
        caller_id_name: '',
        conference: true,
        conferenceId: this.activeConferenceId
      });
      
      this.activeCalls.set(conferenceCall.id, conferenceCall);
      
      this.notifyListeners({
        type: 'participant_joined',
        callId: conferenceCall.id,
        conferenceId: this.activeConferenceId,
        participantNumber: phoneNumber
      });
      
      return conferenceCall;
    } catch (error) {
      console.error('Failed to add participant to conference:', error);
      return null;
    }
  }

  removeFromConference(callId: string): void {
    const call = this.activeCalls.get(callId);
    if (call) {
      call.hangup();
      this.activeCalls.delete(callId);
      
      this.notifyListeners({
        type: 'participant_left',
        callId: callId,
        conferenceId: this.activeConferenceId
      });
    }
  }

  endConference(): void {
    if (this.activeCall) {
      this.activeCall.hangup();
    }
    
    this.activeCalls.forEach((call) => {
      call.hangup();
    });
    
    this.activeCalls.clear();
    this.activeConferenceId = null;
    this.activeCall = null;
  }

  getActiveCall() {
    return this.activeCall;
  }

  getActiveCalls() {
    return Array.from(this.activeCalls.values());
  }

  getActiveConferenceId() {
    return this.activeConferenceId;
  }

  addEventListener(listener: (event: CallEvent) => void): void {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: (event: CallEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  private notifyListeners(event: CallEvent): void {
    this.eventListeners.forEach(listener => listener(event));
  }
}
