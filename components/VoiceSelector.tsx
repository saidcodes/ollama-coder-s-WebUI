import React from 'react';
import { SparklesIcon } from '../constants';
import { TTSVoice as Voice } from '../services/tts';
import { useTTS } from '../contexts/TTSContext';

interface VoiceSelectorProps {
  isExpanded: boolean;
  currentText?: string; // Add this prop to receive the current text
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ isExpanded, currentText = '' }) => {
  const { selectedVoice, setSelectedVoice, autoSelectVoice } = useTTS();
  const [showVoiceSelector, setShowVoiceSelector] = React.useState(false);
  const [isAutoDetect, setIsAutoDetect] = React.useState(false); // Changed default to false

  // Auto-detect language when text changes and auto-detect is enabled
  // Auto-detect language when text changes and auto-detect is enabled
  React.useEffect(() => {
    if (isAutoDetect && currentText) {
      autoSelectVoice(currentText);
    }
  }, [currentText, isAutoDetect, autoSelectVoice]); // Added autoSelectVoice to dependency array

  return (
    <div className="">
      {isExpanded ? (
        <>
          <button
            onClick={() => setShowVoiceSelector(!showVoiceSelector)}
            className="w-full flex items-center space-x-2 text-neutral-300 hover:bg-neutral-700 p-2 rounded-md transition-colors"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>Voice Selection</span>
          </button>
          {showVoiceSelector && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2 text-neutral-300">
                <input
                  type="checkbox"
                  checked={isAutoDetect}
                  onChange={(e) => setIsAutoDetect(e.target.checked)}
                  className="rounded"
                />
                <label>Auto-detect language</label>
              </div>
              {!isAutoDetect && (
                <select 
                  value={selectedVoice}
                  onChange={(e) => {
                    const newVoice = e.target.value as Voice;
                    setSelectedVoice(newVoice);
                  }}
                  className="w-full bg-neutral-800 text-neutral-300 rounded-md p-2 border border-neutral-600 focus:border-blue-500 focus:outline-none"
                >
                  {Object.entries(Voice).map(([key, value]) => (
                    <option key={value} value={value}>
                      {key.toLowerCase()}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </>
      ) : (
        <button
          onClick={() => setShowVoiceSelector(!showVoiceSelector)}
          className="w-full flex justify-center p-2 text-neutral-300 hover:bg-neutral-700 rounded-md transition-colors"
        >
          <SparklesIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default VoiceSelector;