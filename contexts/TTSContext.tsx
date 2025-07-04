import React, { createContext, useContext, useState } from 'react';
import { TTSVoice } from '../services/tts';

interface TTSContextType {
  selectedVoice: TTSVoice;
  setSelectedVoice: (voice: TTSVoice) => void;
  autoSelectVoice: (text: string) => void;
}

const TTSContext = createContext<TTSContextType | null>(null);

export const TTSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedVoice, setSelectedVoice] = useState<TTSVoice>(TTSVoice.BELLA);

  const handleVoiceChange = (voice: string) => {
    // Ensure the voice is a valid TTSVoice enum value
    if (Object.values(TTSVoice).includes(voice as TTSVoice)) {
      console.log('Voice changed to:', voice);
      setSelectedVoice(voice as TTSVoice);
    } else {
      console.warn('Invalid voice value:', voice);
      setSelectedVoice(TTSVoice.BELLA);
    }
  };

  return (
    <TTSContext.Provider value={{
      selectedVoice,
      setSelectedVoice: handleVoiceChange,
      autoSelectVoice: (text: string) => {
        // TODO: Implement language detection and voice selection logic here
        console.log('Auto-selecting voice for text:', text);
        // For now, just set a default voice or keep the current one
        // setSelectedVoice(TTSVoice.BELLA);
      }
    }}>
      {children}
    </TTSContext.Provider>
  );
};

export const useTTS = () => {
  const context = useContext(TTSContext);
  if (!context) {
    throw new Error('useTTS must be used within a TTSProvider');
  }
  return context;
};