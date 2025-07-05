import React, { createContext, useContext, useState } from 'react';
import { TTSVoice } from '../services/tts';

interface TTSContextType {
  selectedVoice: TTSVoice;
  setSelectedVoice: (voice: TTSVoice) => void;
  autoSelectVoice: (text: string) => void;
  isAutoDetect: boolean;
  setIsAutoDetect: (val: boolean) => void;
}

const TTSContext = createContext<TTSContextType | null>(null);

export const TTSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedVoice, setSelectedVoice] = useState<TTSVoice>(TTSVoice.BELLA);
  const [isAutoDetect, setIsAutoDetect] = useState(false);

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

  const autoSelectVoice = (text: string) => {
    // Simple language detection and voice selection
    let detectedVoice = TTSVoice.BELLA; // Default to English female

    if (/[\u3040-\u30ff\u31f0-\u31ff\u3400-\u4dbf\u4e00-\u9faf]/.test(text)) {
      // Japanese characters
      detectedVoice = TTSVoice.ALPHA; // Pick a Japanese voice
    } else if (/[а-яА-ЯЁё]/.test(text)) {
      // Cyrillic (Russian)
      detectedVoice = TTSVoice.MICHAEL; // Pick a male English voice as fallback (no Russian in your enum)
    } else if (/[a-zA-Z]/.test(text)) {
      // Latin (English)
      detectedVoice = TTSVoice.BELLA;
    }
    // You can add more rules for other languages/voices

    setSelectedVoice(detectedVoice);
  };

  return (
    <TTSContext.Provider value={{
      selectedVoice,
      setSelectedVoice: handleVoiceChange,
      autoSelectVoice,
      isAutoDetect,
      setIsAutoDetect,
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