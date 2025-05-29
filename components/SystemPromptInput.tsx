
import React, { useContext, useState } from 'react';
import { OllamaContext } from '../contexts/OllamaContext';
import { InfoIcon } from '../constants';

const SystemPromptInput: React.FC = () => {
  const context = useContext(OllamaContext);
  const [isFocused, setIsFocused] = useState(false);

  if (!context) return null;
  const { systemPrompt, setSystemPrompt } = context;

  return (
    <div className="mb-2">
      <label htmlFor="system-prompt" className="block text-xs font-medium text-neutral-400 mb-1 ml-1">
        System Prompt
      </label>
      <div className={`relative transition-shadow duration-200 rounded-lg ${isFocused ? 'ring-2 ring-blue-500 shadow-lg' : 'ring-1 ring-neutral-700'}`}>
        <textarea
          id="system-prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="e.g., You are a Python expert. Provide concise and efficient code."
          className="w-full p-3 bg-neutral-800 text-neutral-200 rounded-lg focus:outline-none resize-none custom-scrollbar text-sm"
          rows={2}
        />
      </div>
       <p className="mt-1.5 text-xs text-neutral-500 flex items-center">
        <InfoIcon className="w-3 h-3 mr-1.5 flex-shrink-0" />
        This prompt guides the AI's behavior for the entire conversation.
      </p>
    </div>
  );
};

export default SystemPromptInput;
