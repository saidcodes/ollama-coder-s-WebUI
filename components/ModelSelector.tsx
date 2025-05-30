import React, { useContext, useState, useRef, useEffect } from 'react';
import { OllamaContext } from '../contexts/OllamaContext';
import { ChevronDownIcon, CodeBracketIcon } from '../constants';

interface ModelSelectorProps {
  collapsed: boolean;
  forceClose?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ collapsed, forceClose }) => {
  const context = useContext(OllamaContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown when forceClose changes
  useEffect(() => {
    if (forceClose) {
      setIsOpen(false);
    }
  }, [forceClose]);

  if (!context) return null;
  const { models, selectedModel, setSelectedModelByName, isLoading } = context;

  if (isLoading && (!models || models.length === 0)) {
    return <div className="text-sm text-neutral-400">Loading models...</div>;
  }

  if (!models || models.length === 0) {
    return <div className="text-sm text-neutral-400 p-2 bg-neutral-700 rounded-md">No models available.</div>;
  }

  const handleSelectModel = (modelName: string) => {
    setSelectedModelByName(modelName);
    setIsOpen(false);
    
  };
  
  const formatModelSize = (size: number): string => {
    const gb = size / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {collapsed ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 text-neutral-100 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
          title={selectedModel ? selectedModel.name : 'Select a model'}
        >
          <CodeBracketIcon className="w-5 h-5 text-neutral-400" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-neutral-700 hover:bg-neutral-600 text-neutral-100 px-3 py-2.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 transition-colors"
        >
          <span className="truncate">{selectedModel ? selectedModel.name : 'Select a model'}</span>
          <ChevronDownIcon className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
        </button>
      )}
      {isOpen && (
        <div className={`absolute z-10 mt-1 ${collapsed ? 'left-12' : 'w-full'} bg-neutral-800 border border-neutral-600 rounded-md shadow-lg max-h-60 overflow-y-auto styled-scrollbar`}>
          {models.map((model) => (
            <div
              key={model.name}
              onClick={() => handleSelectModel(model.name)}
              className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-neutral-600 ${selectedModel?.name === model.name ? 'bg-neutral-600 text-white' : 'text-neutral-200'
                } transition-colors duration-100 flex items-center justify-between group`}
            >
              <div className="flex items-center">
                <CodeBracketIcon className="w-4 h-4 mr-2 text-neutral-400 group-hover:text-neutral-100"/>
                <span className="truncate">{model.name}</span>
              </div>
              <span className="text-xs text-neutral-400 group-hover:text-neutral-300">{formatModelSize(model.size)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
