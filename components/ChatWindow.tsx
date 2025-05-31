import React, { useContext, useState, useRef, useEffect } from 'react';
import { OllamaContext } from '../contexts/OllamaContext';
import ChatMessage from './ChatMessage';
import { PaperAirplaneIcon, SparklesIcon, StopIcon, DEFAULT_SUGGESTIONS } from '../constants';
import Spinner from './Spinner';


const ChatWindow: React.FC = () => {
  const context = useContext(OllamaContext);
  const [userInput, setUserInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [lastMessageLength, setLastMessageLength] = useState(0);
  const [userHasScrolled, setUserHasScrolled] = useState(false);


  const handleScroll = () => {
    if (!chatContainerRef.current || !context?.isLoading) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    
    // Only set userHasScrolled to true if we're not at the bottom
    if (!isAtBottom) {
      setUserHasScrolled(true);
    }
  };

  useEffect(() => {
    if (!chatContainerRef.current || !context) return;
    
    const { currentAssistantMessage, isLoading } = context;
    
    // Reset userHasScrolled when a new message starts
    if (currentAssistantMessage?.length === 1) {
      setUserHasScrolled(false);
    }
    
    // Scroll to bottom if:
    // 1. New message starts (length === 1)
    // 2. Message completes (isLoading becomes false)
    // 3. Message added to history
    // 4. During streaming IF user hasn't scrolled away
    if (
      (currentAssistantMessage?.length === 1) || // New message starts
      (!isLoading && currentAssistantMessage) || // Message completed
      (!currentAssistantMessage && lastMessageLength > 0) || // Message added to history
      (isLoading && !userHasScrolled) // During streaming, but only if user hasn't scrolled
    ) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    
    setLastMessageLength(currentAssistantMessage?.length ?? 0);
  }, [context?.chatHistory, context?.currentAssistantMessage, context?.isLoading, userHasScrolled]);

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
  const randomSuggestions = DEFAULT_SUGGESTIONS.sort(() => 0.5 - Math.random()).slice(0, 4);
  

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4  ">
        <div className="flex items-center space-x-2">
          
          <SparklesIcon className="w-5 h-5 text-purple-400" />
          <span className="text-neutral-200 font-semibold">{selectedModel?.name || 'Select Model'}</span>
        </div>
      
      </div>

      {/* Chat Container */}
      <div 
        ref={chatContainerRef} 
        className="flex-1 overflow-y-auto custom-scrollbar"
        onScroll={handleScroll}
      >
        <div className="max-w-3xl mx-auto p-4 space-y-6">
          {isChatEmpty && (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
              
          
            <SparklesIcon className={ ` w-16 h-16 text-purple-400 mb-4`}
 /> 
              <h2 className="text-2xl font-semibold text-neutral-100 mb-2">How can I help you today?</h2>
              <p className="text-neutral-400 mb-6">Select a model and start typing, or try one of these examples:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                
                 {Array.from({ length: 4 }).map((_, i) => (
                  
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(randomSuggestions[i])}
                    className="bg-neutral-700 hover:bg-neutral-600 p-4 rounded-xl text-sm text-neutral-300 text-left transition-colors"
                  >
                    {randomSuggestions[i]}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Chat Messages */}
          <div className="space-y-6">
            {chatHistory.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {currentAssistantMessage && !isLoading && (
              <ChatMessage 
                key="streaming" 
                message={{ 
                  id: 'streaming', 
                  role: 'assistant', 
                  content: currentAssistantMessage, 
                  timestamp: new Date() 
                }} 
              />
            )}
            {isLoading && currentAssistantMessage && (
              <ChatMessage 
                key="streaming-loading" 
                message={{ 
                  id: 'streaming-loading', 
                  role: 'assistant', 
                  content: currentAssistantMessage, 
                  timestamp: new Date() 
                }} 
                isStreaming={true}
              />
            )}
            {isLoading && !currentAssistantMessage && (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            )}
            {error && (
              <div className="text-red-400 bg-red-900/50 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-neutral-700 bg-transparent">
        <div className="max-w-3xl mx-auto p-4">
          <div className="flex items-end space-x-2 bg-neutral-700 rounded-xl p-2">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={selectedModel ? `Message ${selectedModel.name}...` : "Select a model first..."}
              className="flex-1 p-2 bg-transparent text-neutral-100 focus:outline-none resize-none custom-scrollbar text-sm placeholder-neutral-500"
              rows={1}
              style={{ maxHeight: '150px', minHeight: '44px' }}
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
    </div>
  );
};

export default ChatWindow;
