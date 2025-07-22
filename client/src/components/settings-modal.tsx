import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useWebRTC } from '@/hooks/use-webrtc';
import type { Settings } from '@shared/schema';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [credentials, setCredentials] = useState({
    telnyxApiKey: '',
    sipUsername: '',
    sipPassword: '',
    connectionServer: 'rtc.telnyx.com',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { initializeClient } = useWebRTC();

  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      const response = await apiRequest('PUT', '/api/settings', settingsData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings Saved",
        description: "Your Telnyx settings have been updated",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Unable to save settings",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (settings) {
      setCredentials({
        telnyxApiKey: settings.telnyxApiKey || '',
        sipUsername: settings.sipUsername || '',
        sipPassword: settings.sipPassword || '',
        connectionServer: settings.connectionServer || 'rtc.telnyx.com',
      });
    }
  }, [settings]);

  const handleSave = () => {
    // Check if we have either API key or SIP credentials
    const hasApiKey = credentials.telnyxApiKey.trim();
    const hasSipCredentials = credentials.sipUsername.trim() && credentials.sipPassword.trim();
    
    if (!hasApiKey && !hasSipCredentials) {
      toast({
        title: "Missing Credentials",
        description: "Please provide either a Telnyx API key or SIP username/password",
        variant: "destructive",
      });
      return;
    }

    saveSettingsMutation.mutate(credentials);
  };

  const handleTestConnection = async () => {
    // Check if we have either API key or SIP credentials
    const hasApiKey = credentials.telnyxApiKey.trim();
    const hasSipCredentials = credentials.sipUsername.trim() && credentials.sipPassword.trim();
    
    if (!hasApiKey && !hasSipCredentials) {
      toast({
        title: "Missing Credentials",
        description: "Please provide either a Telnyx API key or SIP username/password",
        variant: "destructive",
      });
      return;
    }

    try {
      if (hasSipCredentials) {
        // Test with SIP credentials (preferred for WebRTC)
        await initializeClient(''); // Empty token triggers SIP mode
        toast({
          title: "Connection Successful",
          description: "Successfully connected to Telnyx WebRTC with SIP credentials",
        });
      } else {
        // Test with API key
        await initializeClient(credentials.telnyxApiKey);
        toast({
          title: "Connection Attempted",
          description: "API key tested. Note: SIP credentials work better for WebRTC.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Unable to connect with the provided credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-softphone-panel border border-softphone-border rounded-2xl p-8 w-[600px] max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Settings</h2>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="w-8 h-8 bg-softphone-card hover:bg-softphone-border border-softphone-border p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Tabs defaultValue="credentials" className="w-full">
          <TabsList className="bg-transparent h-auto p-0 space-x-6 mb-6">
            <TabsTrigger 
              value="credentials"
              className="border-b-2 border-transparent data-[state=active]:border-softphone-accent data-[state=active]:text-softphone-accent bg-transparent text-softphone-text-secondary hover:text-softphone-text-primary py-2 px-1 text-sm font-medium rounded-none"
            >
              Telnyx Credentials
            </TabsTrigger>
            <TabsTrigger 
              value="audio"
              className="border-b-2 border-transparent data-[state=active]:border-softphone-accent data-[state=active]:text-softphone-accent bg-transparent text-softphone-text-secondary hover:text-softphone-text-primary py-2 px-1 text-sm font-medium rounded-none"
            >
              Audio Settings
            </TabsTrigger>
            <TabsTrigger 
              value="general"
              className="border-b-2 border-transparent data-[state=active]:border-softphone-accent data-[state=active]:text-softphone-accent bg-transparent text-softphone-text-secondary hover:text-softphone-text-primary py-2 px-1 text-sm font-medium rounded-none"
            >
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credentials" className="space-y-6">
            <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-amber-200 mb-2">WebRTC Authentication</h3>
                  <p className="text-xs text-amber-300 mb-2">
                    <strong>For WebRTC calling, you need SIP credentials, not API keys.</strong>
                  </p>
                  <p className="text-xs text-amber-300 mb-1">
                    Get SIP credentials from your Telnyx Portal:
                  </p>
                  <ol className="text-xs text-amber-300 list-decimal list-inside space-y-1 ml-2">
                    <li>Go to Voice → SIP Trunking → IP Connections</li>
                    <li>Create or select your IP Connection</li>
                    <li>Go to Credentials tab</li>
                    <li>Create SIP username and password</li>
                  </ol>
                </div>
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">Telnyx API Key</Label>
              <Input
                type="password"
                placeholder="KEY01234567890ABCDEF..."
                value={credentials.telnyxApiKey}
                onChange={(e) => setCredentials(prev => ({ ...prev, telnyxApiKey: e.target.value }))}
                className="bg-softphone-card border-softphone-border font-mono focus:ring-softphone-accent"
              />
              <p className="text-xs text-softphone-text-secondary mt-1">
                API key (won't work for WebRTC calling)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium mb-2">SIP Username</Label>
                <Input
                  type="text"
                  placeholder="user@telnyx.com"
                  value={credentials.sipUsername}
                  onChange={(e) => setCredentials(prev => ({ ...prev, sipUsername: e.target.value }))}
                  className="bg-softphone-card border-softphone-border focus:ring-softphone-accent"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-2">SIP Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={credentials.sipPassword}
                  onChange={(e) => setCredentials(prev => ({ ...prev, sipPassword: e.target.value }))}
                  className="bg-softphone-card border-softphone-border focus:ring-softphone-accent"
                />
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">Connection Server</Label>
              <Select 
                value={credentials.connectionServer} 
                onValueChange={(value) => setCredentials(prev => ({ ...prev, connectionServer: value }))}
              >
                <SelectTrigger className="bg-softphone-card border-softphone-border focus:ring-softphone-accent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-softphone-card border-softphone-border">
                  <SelectItem value="rtc.telnyx.com">rtc.telnyx.com (Default)</SelectItem>
                  <SelectItem value="rtc-us-east.telnyx.com">rtc-us-east.telnyx.com</SelectItem>
                  <SelectItem value="rtc-eu-west.telnyx.com">rtc-eu-west.telnyx.com</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Connection Test */}
            <div className="bg-softphone-card border border-softphone-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Connection Status</h4>
                  <p className="text-sm text-softphone-text-secondary">Test your Telnyx configuration</p>
                </div>
                <Button
                  onClick={handleTestConnection}
                  className="bg-softphone-accent hover:bg-blue-600"
                >
                  Test Connection
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audio" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-softphone-text-secondary">Audio settings are available in the sidebar</p>
            </div>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-softphone-text-secondary">General settings coming soon</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Settings Actions */}
        <div className="flex space-x-4 pt-6 border-t border-softphone-border mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-softphone-card hover:bg-softphone-border border-softphone-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveSettingsMutation.isPending}
            className="flex-1 bg-softphone-accent hover:bg-blue-600"
          >
            {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
