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
        // Request permissions first
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
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
