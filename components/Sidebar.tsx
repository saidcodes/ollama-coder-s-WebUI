import React, { useContext, useState } from 'react';
import { OllamaContext } from '../contexts/OllamaContext';
import ModelSelector from './ModelSelector';
import { PlusCircleIcon, TrashIcon, CogIcon, SparklesIcon, ChatBubbleLeftRightIcon, AdjustmentsHorizontalIcon, ChevronDoubleRightIcon, ChevronDoubleLeftIcon } from '../constants';
import SystemPromptInput from './SystemPromptInput';


const Sidebar: React.FC = () => {
  const context = useContext(OllamaContext);
  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);

  if (!context) return null;

  const { clearChat, isLoading } = context;

  // Determine if sidebar should be expanded
  const isExpanded = !collapsed || isHovered;

  return (
    <div 
      className={`${isExpanded ? 'w-64' : 'w-16'} bg-neutral-800 p-4 space-y-6 border-r border-neutral-700 flex flex-col transition-all duration-300`}
      onMouseEnter={(e) => {
        // Only set hover if the target is not the collapse button or its children
        if (!(e.target as HTMLElement).closest('button[aria-label*="sidebar"]')) {
          collapsed && setIsHovered(true);
        }
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-neutral-700 transition-colors"
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
         {collapsed ? <ChevronDoubleRightIcon className="w-5 h-5 text-neutral-300" /> : <ChevronDoubleLeftIcon className="w-5 h-5 text-neutral-300" />} 
        </button>
        {isExpanded && (
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5 text-purple-400" />
            <h1 className="text-lg font-semibold text-neutral-100">Ollama Coder</h1>
          </div>
        )}
      </div>
      
      <button
        onClick={clearChat}
        disabled={isLoading}
        className={`w-full flex items-center ${isExpanded ? 'justify-start px-4' : 'justify-center px-2'
          } bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-600 text-white font-medium py-2 rounded-lg transition-colors duration-150`}
      >
        <PlusCircleIcon className="w-5 h-5 flex-shrink-0" />
        {isExpanded && <span className="ml-2">New Chat</span>}
      </button>

      <div className="flex-grow space-y-4">
        {isExpanded && (
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Models</h2>
        )}
        <ModelSelector collapsed={!isExpanded} />
      </div>
      <div className="space-y-4">
        {isExpanded && (
          <>
            <button
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              className="w-full flex items-center space-x-2 text-neutral-300 hover:bg-neutral-700 p-2 rounded-md transition-colors"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              <span>System Prompt</span>
            </button>
            {showSystemPrompt && <SystemPromptInput />}
          </>
        )}
        {!isExpanded && (
          <button
            onClick={() => setShowSystemPrompt(!showSystemPrompt)}
            className="w-full flex justify-center p-2 text-neutral-300 hover:bg-neutral-700 rounded-md transition-colors"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Footer actions - example */}
      {/* <div className="mt-auto space-y-2 border-t border-neutral-700 pt-4">
        <button className="w-full flex items-center space-x-2 text-neutral-300 hover:bg-neutral-700 p-2 rounded-md transition-colors">
          <CogIcon className="w-5 h-5" />
          {isExpanded && <span>Settings</span>}
        </button>
      </div> */}
    </div>
  );
};

export default Sidebar;
