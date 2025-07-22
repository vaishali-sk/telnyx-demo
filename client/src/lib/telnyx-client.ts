import { TelnyxRTC } from '@telnyx/webrtc';

export interface TelnyxConfig {
  token: string;
  debug?: boolean;
}

export interface CallEvent {
  type: 'incoming' | 'connecting' | 'connected' | 'ended' | 'failed';
  callId?: string;
  callerName?: string;
  callerNumber?: string;
  duration?: number;
}

export class TelnyxClient {
  private client: any;
  private activeCall: any = null;
  private eventListeners: ((event: CallEvent) => void)[] = [];

  constructor(config: TelnyxConfig) {
    this.client = new TelnyxRTC({
      login_token: config.token,
      debug: config.debug || false,
    });

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
    return this.client.connect();
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

  getActiveCall() {
    return this.activeCall;
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
