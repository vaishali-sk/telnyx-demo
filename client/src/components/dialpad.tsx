import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DialpadProps {
  onDial: (phoneNumber: string) => void;
}

export function Dialpad({ onDial }: DialpadProps) {
  const [phoneNumber, setPhoneNumber] = useState('');

  const dialpadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  const handleDialpadPress = (digit: string) => {
    setPhoneNumber(prev => prev + digit);
  };

  const handleDial = () => {
    if (phoneNumber.trim()) {
      onDial(phoneNumber);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDial();
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Label className="block text-sm font-medium mb-2">Dial Number</Label>
        <div className="relative">
          <Input
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full bg-softphone-card border-softphone-border text-lg font-mono focus:ring-softphone-accent focus:border-transparent pr-14"
          />
          <Button
            onClick={handleDial}
            disabled={!phoneNumber.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-softphone-success hover:bg-green-600 p-0"
          >
            <Phone className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Dialpad Grid */}
      <div className="grid grid-cols-3 gap-2">
        {dialpadNumbers.flat().map((digit) => (
          <Button
            key={digit}
            variant="outline"
            onClick={() => handleDialpadPress(digit)}
            className="h-12 bg-softphone-card hover:bg-softphone-border border-softphone-border font-mono text-lg text-softphone-text-primary"
          >
            {digit}
          </Button>
        ))}
      </div>
    </div>
  );
}
