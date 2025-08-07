import React, { useContext, useState } from "react";
import { OllamaContext } from "../contexts/OllamaContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const ollamaContext = useContext(OllamaContext);
  const [apiUrl, setApiUrl] = useState(ollamaContext?.ollamaApiUrl || "");
  const [isStreamingSoundEnabled, setIsStreamingSoundEnabled] = useState(
    ollamaContext?.isStreamingSoundEnabled ?? true
  );

  React.useEffect(() => {
    if (ollamaContext) {
      setIsStreamingSoundEnabled(ollamaContext.isStreamingSoundEnabled ?? true);
    }
  }, [ollamaContext]);

  const handleStreamingSoundToggle = () => {
    if (ollamaContext) {
      ollamaContext.setIsStreamingSoundEnabled(!isStreamingSoundEnabled);
      setIsStreamingSoundEnabled(!isStreamingSoundEnabled);
    }
  };

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (ollamaContext) {
      ollamaContext.setOllamaApiUrl(apiUrl);
      ollamaContext.setIsStreamingSoundEnabled(isStreamingSoundEnabled);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-lg z-50 flex justify-center items-center">
      <div className="bg-neutral-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-100">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-white"
            aria-label="Close settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-neutral-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="api-url"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Ollama API URL
            </label>
            <input
              type="text"
              id="api-url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="streaming-sound-enabled"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Streaming Sound Effect
            </label>
            <button
              id="streaming-sound-enabled"
              onClick={handleStreamingSoundToggle}
              className={`w-11 h-6 bg-neutral-600 rounded-full peer ${
                isStreamingSoundEnabled ? "bg-blue-600" : ""
              } flex items-center space-x-1 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 data-[te-switch-state-active]:bg-blue-600 cursor-pointer`}
            >
              <span
                className={`h-4 w-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  isStreamingSoundEnabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              ></span>
            </button>
          </div>
          <div className="flex justify-end space-x-2">
            <button onClick={onClose}
              className="px-4 py-2 rounded-md text-neutral-300 hover:bg-neutral-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
