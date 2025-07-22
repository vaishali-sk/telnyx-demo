import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAudioDevices } from '@/hooks/use-audio-devices';

export function DeviceSettings() {
  const {
    microphones,
    speakers,
    selectedMicrophone,
    selectedSpeaker,
    setSelectedMicrophone,
    setSelectedSpeaker,
  } = useAudioDevices();

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Audio Devices</h3>
      <div className="space-y-3">
        <div>
          <Label className="block text-xs text-softphone-text-secondary mb-1">
            Microphone
          </Label>
          <Select value={selectedMicrophone} onValueChange={setSelectedMicrophone}>
            <SelectTrigger className="bg-softphone-card border-softphone-border text-sm focus:ring-softphone-accent">
              <SelectValue placeholder="Select microphone" />
            </SelectTrigger>
            <SelectContent className="bg-softphone-card border-softphone-border">
              {microphones.filter(device => device.deviceId).map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId || 'default'}>
                  {device.label || 'Default Microphone'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="block text-xs text-softphone-text-secondary mb-1">
            Speaker
          </Label>
          <Select value={selectedSpeaker} onValueChange={setSelectedSpeaker}>
            <SelectTrigger className="bg-softphone-card border-softphone-border text-sm focus:ring-softphone-accent">
              <SelectValue placeholder="Select speaker" />
            </SelectTrigger>
            <SelectContent className="bg-softphone-card border-softphone-border">
              {speakers.filter(device => device.deviceId).map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId || 'default'}>
                  {device.label || 'Default Speaker'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
