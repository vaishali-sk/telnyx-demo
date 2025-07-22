import { useState } from 'react';
import { Phone, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialpad } from '@/components/dialpad';
import { CallHistory } from '@/components/call-history';
import { DeviceSettings } from '@/components/device-settings';
import { ActiveCallOverlay } from '@/components/active-call-overlay';
import { IncomingCallModal } from '@/components/incoming-call-modal';
import { SettingsModal } from '@/components/settings-modal';
import { ConferenceModal } from '@/components/conference-modal';
import { useWebRTC } from '@/hooks/use-webrtc';

export default function Softphone() {
  const [showSettings, setShowSettings] = useState(false);
  const [showConference, setShowConference] = useState(false);
  const { callState, makeCall, answerCall, hangupCall, toggleMute, toggleHold } = useWebRTC();

  const handleDial = (phoneNumber: string) => {
    makeCall(phoneNumber);
  };

  return (
    <div className="flex h-screen bg-softphone-bg text-softphone-text-primary">
      {/* Sidebar */}
      <div className="w-80 bg-softphone-panel border-r border-softphone-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-softphone-border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-softphone-accent rounded-lg flex items-center justify-center">
              <Phone className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Telnyx Softphone</h1>
              <p className="text-softphone-text-secondary text-sm">
                {callState.isConnected ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2 bg-softphone-card p-3 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${callState.isConnected ? 'bg-softphone-success animate-pulse' : 'bg-softphone-error'}`}></div>
            <span className="text-sm font-medium">
              {callState.isConnected ? 'Connected to Telnyx' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Dialpad */}
        <div className="p-6 border-b border-softphone-border">
          <Dialpad onDial={handleDial} />
        </div>

        {/* Device Settings */}
        <div className="p-6 border-b border-softphone-border">
          <DeviceSettings />
        </div>

        {/* Quick Actions */}
        <div className="p-6 mt-auto">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1 bg-softphone-card hover:bg-softphone-border border-softphone-border text-softphone-text-primary"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="destructive"
              className="flex-1 bg-softphone-error hover:bg-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-softphone-panel border-b border-softphone-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold">Call Center</h2>
              {callState.activeCall && (
                <div className="flex items-center space-x-2 bg-softphone-success px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white">Call Active</span>
                </div>
              )}
            </div>
            
            {/* Call Quality Indicator */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-softphone-text-secondary">Quality:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-1 h-4 rounded-full ${
                        i <= 4 ? 'bg-softphone-success' : 'bg-softphone-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-softphone-success">Excellent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="history" className="flex-1 flex flex-col">
          <div className="border-b border-softphone-border">
            <TabsList className="bg-transparent h-auto p-0 space-x-8 px-6">
              <TabsTrigger 
                value="history" 
                className="border-b-2 border-transparent data-[state=active]:border-softphone-accent data-[state=active]:text-softphone-accent bg-transparent text-softphone-text-secondary hover:text-softphone-text-primary py-4 px-1 text-sm font-medium rounded-none"
              >
                Call History
              </TabsTrigger>
              <TabsTrigger 
                value="contacts"
                className="border-b-2 border-transparent data-[state=active]:border-softphone-accent data-[state=active]:text-softphone-accent bg-transparent text-softphone-text-secondary hover:text-softphone-text-primary py-4 px-1 text-sm font-medium rounded-none"
              >
                Contacts
              </TabsTrigger>
              <TabsTrigger 
                value="conference"
                className="border-b-2 border-transparent data-[state=active]:border-softphone-accent data-[state=active]:text-softphone-accent bg-transparent text-softphone-text-secondary hover:text-softphone-text-primary py-4 px-1 text-sm font-medium rounded-none"
              >
                Conference
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="history" className="flex-1 overflow-y-auto p-6 mt-0">
            <CallHistory onRedial={handleDial} />
          </TabsContent>

          <TabsContent value="contacts" className="flex-1 overflow-y-auto p-6 mt-0">
            <div className="text-center py-12">
              <p className="text-softphone-text-secondary">No contacts available</p>
            </div>
          </TabsContent>

          <TabsContent value="conference" className="flex-1 overflow-y-auto p-6 mt-0">
            <div className="text-center py-12">
              <Button
                onClick={() => setShowConference(true)}
                className="bg-softphone-accent hover:bg-blue-600"
              >
                Start Conference Call
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals and Overlays */}
      {callState.activeCall && (
        <ActiveCallOverlay
          call={callState.activeCall}
          isMuted={callState.isMuted}
          isOnHold={callState.isOnHold}
          onMute={toggleMute}
          onHold={toggleHold}
          onHangup={hangupCall}
          onConference={() => setShowConference(true)}
        />
      )}

      {callState.incomingCall && (
        <IncomingCallModal
          call={callState.incomingCall}
          onAccept={answerCall}
          onDecline={hangupCall}
        />
      )}

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      {showConference && (
        <ConferenceModal onClose={() => setShowConference(false)} />
      )}
    </div>
  );
}
