import React, { useContext } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

import { OllamaContext } from './contexts/OllamaContext';
import {  ExclamationTriangleIcon } from './constants';
import { TTSProvider } from './contexts/TTSContext';
const App: React.FC = () => {
  const ollamaContext = useContext(OllamaContext);

  if (!ollamaContext) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-900 text-neutral-100">
        Loading context...
      </div>
    );
  }
  
  const { models, ollamaApiUrl, fetchModels, error: contextError } = ollamaContext;

  const isOllamaLikelyDown = models === null;


  return (
    <TTSProvider>
    <div className="flex h-screen  antialiased text-neutral-300 bg-neutral-850">
      <Sidebar  />
       <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
    
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col p-2 md:p-6 overflow-y-auto bg-neutral-800 space-y-4">
          {isOllamaLikelyDown && (
             <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
                <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-semibold text-neutral-100 mb-2">Ollama Not Detected</h2>
                <p className="text-neutral-400 mb-4">
                  Could not fetch models from Ollama. Please ensure Ollama is running locally at
                  <code className="bg-neutral-700 px-1.5 py-1 rounded text-sm mx-1.5">{ollamaApiUrl}</code>
                  and is accessible.
                </p>
                {contextError && (
                  <div className="mt-2 mb-4 p-3 bg-red-900/40 border border-red-700/60 rounded-md text-red-300 text-xs text-left max-w-xl w-full shadow">
                    <p className="font-semibold mb-1.5 text-red-200">Error Details:</p>
                    <p className="whitespace-pre-wrap leading-relaxed">{contextError}</p>
                  </div>
                )}
                <button
                  onClick={() => fetchModels()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Retry Connection
                </button>
             </div>
           )}
           {!isOllamaLikelyDown && (
            <>
          
              <ChatWindow />
            </>
           )}
        </main>
      </div>
    </div>
  </TTSProvider>);
};

export default App;
