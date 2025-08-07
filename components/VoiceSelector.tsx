import React from "react";
import { SparklesIcon } from "../constants";
import { TTSVoice as Voice } from "../services/tts";
import { useTTS } from "../contexts/TTSContext";

interface VoiceSelectorProps {
  isExpanded: boolean;
  currentText?: string; // Add this prop to receive the current text
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  isExpanded,
  currentText = "",
}) => {
  const {
    selectedVoice,
    setSelectedVoice,
    autoSelectVoice,
    isAutoDetect,
    setIsAutoDetect,
  } = useTTS();
  const [showVoiceSelector, setShowVoiceSelector] = React.useState(false);

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
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsAutoDetect(checked);
                    // Only call autoSelectVoice when enabling auto-detect
                    if (checked && currentText) {
                      autoSelectVoice(currentText);
                    }
                  }}
                  className="rounded"
                  
                />
                <label>Auto-detect language</label>
              </div>
              {isAutoDetect && (
                <div className="text-neutral-400 text-xs">
                  Auto-detected voice: {selectedVoice}
                </div>
              )}
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
