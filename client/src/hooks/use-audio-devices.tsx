import { useState, useEffect } from 'react';

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
}

export function useAudioDevices() {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');

  useEffect(() => {
    const getDevices = async () => {
      try {
        // Check if mediaDevices is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.warn('MediaDevices API not supported');
          return;
        }

        // Request permissions first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Stop the stream after getting permission
        stream.getTracks().forEach(track => track.stop());
        
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = deviceList
          .filter(device => device.kind === 'audioinput' || device.kind === 'audiooutput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `${device.kind === 'audioinput' ? 'Microphone' : 'Speaker'} ${device.deviceId.slice(0, 5)}`,
            kind: device.kind as 'audioinput' | 'audiooutput',
          }));

        setDevices(audioDevices);

        // Set default devices
        const defaultMic = audioDevices.find(d => d.kind === 'audioinput');
        const defaultSpeaker = audioDevices.find(d => d.kind === 'audiooutput');
        
        if (defaultMic && !selectedMicrophone) {
          setSelectedMicrophone(defaultMic.deviceId);
        }
        if (defaultSpeaker && !selectedSpeaker) {
          setSelectedSpeaker(defaultSpeaker.deviceId);
        }
      } catch (error) {
        console.error('Error getting audio devices:', error);
        // Set some default devices even if permission is denied
        setDevices([
          { deviceId: 'default', label: 'Default Microphone', kind: 'audioinput' },
          { deviceId: 'default', label: 'Default Speaker', kind: 'audiooutput' }
        ]);
        setSelectedMicrophone('default');
        setSelectedSpeaker('default');
      }
    };

    getDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, [selectedMicrophone, selectedSpeaker]);

  const microphones = devices.filter(d => d.kind === 'audioinput');
  const speakers = devices.filter(d => d.kind === 'audiooutput');

  return {
    microphones,
    speakers,
    selectedMicrophone,
    selectedSpeaker,
    setSelectedMicrophone,
    setSelectedSpeaker,
  };
}
