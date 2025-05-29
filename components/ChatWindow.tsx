import React, { useContext, useState, useRef, useEffect } from 'react';
import { OllamaContext } from '../contexts/OllamaContext';
import ChatMessage from './ChatMessage';
import { PaperAirplaneIcon, SparklesIcon, StopIcon, DEFAULT_SUGGESTIONS } from '../constants';
import Spinner from './Spinner';

const ChatWindow: React.FC = () => {
  const context = useContext(OllamaContext);
  const [userInput, setUserInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [context?.chatHistory, context?.currentAssistantMessage, context?.isLoading]);

  if (!context) return null;
  const { chatHistory, sendMessage, isLoading, currentAssistantMessage, selectedModel, error, stopGeneration } = context;

  const handleSend = () => {
    if (userInput.trim() && selectedModel) {
      sendMessage(userInput);
      setUserInput('');
    }
  };

  const handleButtonClick = () => {
    if (isLoading) {
      stopGeneration();
    } else {
      handleSend();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setUserInput(suggestion);
  };

  const isChatEmpty = chatHistory.length === 0 && !currentAssistantMessage && !isLoading;

  return (
    <div className="flex flex-col flex-1 h-full bg-neutral-850 rounded-lg shadow-xl overflow-hidden">
      <div ref={chatContainerRef} className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto custom-scrollbar">
        {isChatEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <SparklesIcon className="w-16 h-16 text-purple-400 mb-4" />
            <h2 className="text-2xl font-semibold text-neutral-100 mb-2">Hello! How can I help you code today?</h2>
            <p className="text-neutral-400 mb-6">Select a model and start typing, or try one of these examples:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl">
              {DEFAULT_SUGGESTIONS.slice(0,3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="bg-neutral-700 hover:bg-neutral-650 p-3 rounded-lg text-sm text-neutral-300 text-left transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {chatHistory.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {currentAssistantMessage && !isLoading && ( // Show streamed message if not loading final chunk
          <ChatMessage key="streaming" message={{ id: 'streaming', role: 'assistant', content: currentAssistantMessage, timestamp: new Date() }} />
        )}
         {isLoading && currentAssistantMessage && ( // Specifically for streaming partial response
          <ChatMessage key="streaming-loading" message={{ id: 'streaming-loading', role: 'assistant', content: currentAssistantMessage, timestamp: new Date() }} isStreaming={true}/>
        )}
        {isLoading && !currentAssistantMessage && <div className="flex justify-center py-4"><Spinner /></div>}
        {error && <div className="text-red-400 bg-red-900 p-3 rounded-md text-sm">{error}</div>}
      </div>
      <div className="p-3 md:p-4 border-t border-neutral-700 bg-neutral-850">
        <div className="flex items-end space-x-2 bg-neutral-750 rounded-xl p-1.5 shadow">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedModel ? `Ask ${selectedModel.name}... (Shift+Enter for newline)` : "Select a model first..."}
            className="flex-1 p-2.5 bg-transparent text-neutral-100 focus:outline-none resize-none custom-scrollbar text-sm placeholder-neutral-500"
            rows={1}
            style={{ maxHeight: '150px', minHeight: '44px' }} // Dynamic height
            disabled={!selectedModel || isLoading}
          />
          <button
            onClick={handleButtonClick}
            disabled={(!userInput.trim() && !isLoading) || !selectedModel}
            className={`${
              isLoading 
                ? 'bg-red-600 hover:bg-red-500' 
                : 'bg-blue-600 hover:bg-blue-500'
            } disabled:bg-neutral-600 text-white p-2.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400`}
            aria-label={isLoading ? "Stop generation" : "Send message"}
          >
            {isLoading && !currentAssistantMessage ? (
              <Spinner size="sm" />
            ) : isLoading ? (
              <StopIcon className="w-5 h-5" />
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
          
          </button>
        </div>
         <p className="mt-2 text-xs text-neutral-500 text-center">
          AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
