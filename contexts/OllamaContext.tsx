
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { OllamaModel, OllamaTagResponse, Message, OllamaContextType, OllamaChatRequestBody, OllamaChatStreamChunk } from '../types';
import { OLLAMA_API_BASE_URL } from '../constants';
import { fetchModels as apiFetchModels, streamChat as apiStreamChat } from '../services/ollamaService';

export const OllamaContext = createContext<OllamaContextType | undefined>(undefined);

interface OllamaProviderProps {
  children: ReactNode;
}

export const OllamaProvider: React.FC<OllamaProviderProps> = ({ children }) => {
  const [models, setModels] = useState<OllamaModel[] | null>([]);
  const [selectedModel, setSelectedModel] = useState<OllamaModel | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>("You are a helpful AI coding assistant. Provide clear, concise, and correct code examples and explanations. Format code blocks appropriately for easy readability.");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ollamaApiUrl, setOllamaApiUrlState] = useState<string>(OLLAMA_API_BASE_URL);


  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedModels = await apiFetchModels(ollamaApiUrl);
      setModels(fetchedModels);
      if (fetchedModels.length > 0 && !selectedModel) {
        const currentSelectedStillExists = selectedModel && fetchedModels.some(m => m.name === selectedModel.name);
        if (currentSelectedStillExists) {
            setSelectedModel(fetchedModels.find(m => m.name === selectedModel!.name) || fetchedModels[0]);
        } else {
            setSelectedModel(fetchedModels[0]);
        }
      } else if (fetchedModels.length === 0) {
        setSelectedModel(null);
      }
    } catch (e) {
      // Refined console logging
      if (e instanceof TypeError && e.message.toLowerCase().includes('failed to fetch')) {
        console.error(`Network error while trying to fetch models from ${ollamaApiUrl}: ${e.message}. This is often a CORS issue or Ollama server problem. Check the UI for detailed troubleshooting steps.`);
      } else {
        console.error(`Error fetching models from ${ollamaApiUrl}:`, e);
      }

      let specificErrorDetails = "";
      if (e instanceof TypeError && e.message.toLowerCase().includes('failed to fetch')) {
        specificErrorDetails = `A network connection to Ollama failed: "${e.message}".

This usually means:
1.  **Ollama Server Offline/Unreachable:** The Ollama server is not running, or it's not accessible at the URL: ${ollamaApiUrl}.
    *   **Action:** Ensure 'ollama serve' is running and there are no firewalls blocking access.

2.  **CORS Policy Issue (Very Common):** Your browser is blocking the request due to security (CORS). This happens if the app (e.g., served from a development server like http://localhost:3000) and Ollama (typically http://localhost:11434) are on different origins.
    *   **Action (Recommended for Ollama):** Configure Ollama to allow requests from this app's origin. Set the \`OLLAMA_ORIGINS\` environment variable when starting Ollama.
        *   Example: If your app runs on port 3000, use: \`OLLAMA_ORIGINS=http://localhost:3000 ollama serve\`
        *   To allow all origins (less secure, useful for local development only): \`OLLAMA_ORIGINS=* ollama serve\`
        *   Refer to the official Ollama documentation for the most current instructions on setting \`OLLAMA_ORIGINS\`.
    *   **Action (Alternative for Local Dev):** Use a browser extension that disables CORS (use with extreme caution and only for trusted local development environments).

3.  **Incorrect API URL:** The URL \`${ollamaApiUrl}\` might be incorrect.

Please verify your Ollama setup, network configuration, and CORS settings.`;
      } else if (e instanceof Error) {
        specificErrorDetails = `Failed to fetch models. Error: ${e.message}`;
      } else {
        specificErrorDetails = `An unknown error occurred while fetching models. Details: ${String(e)}`;
      }
      setError(specificErrorDetails);
      setModels(null); // Indicate an error state for models
      setSelectedModel(null);
    } finally {
      setIsLoading(false);
    }
  }, [ollamaApiUrl, selectedModel]);

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ollamaApiUrl]); 

  const setSelectedModelByName = (name: string) => {
    if(models){
      const model = models.find(m => m.name === name) || null;
      setSelectedModel(model);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setCurrentAssistantMessage(null);
    setError(null); 
  };

  const sendMessage = async (userPrompt: string) => {
    if (!selectedModel || !userPrompt.trim()) {
      setError("Please select a model and enter a prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentAssistantMessage("");

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userPrompt,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, newUserMessage]);
    
    const messagesToApi: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];
    if (systemPrompt.trim()) {
      messagesToApi.push({ role: 'system', content: systemPrompt });
    }
    
    const historyForApi = chatHistory.map(msg => ({ role: msg.role, content: msg.content }));
    messagesToApi.push(...historyForApi);
    messagesToApi.push({ role: 'user', content: userPrompt });


    const requestBody: OllamaChatRequestBody = {
      model: selectedModel.name,
      messages: messagesToApi,
      stream: true,
    };

    try {
      let fullResponse = "";
      for await (const chunk of apiStreamChat(ollamaApiUrl, requestBody)) {
        if (chunk.message && chunk.message.content) {
          fullResponse += chunk.message.content;
          setCurrentAssistantMessage(prev => (prev || "") + chunk.message.content);
        }
        if (chunk.done) {
          if ((chunk as any).error) { 
             throw new Error((chunk as any).error);
          }
          break;
        }
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, assistantMessage]);

    } catch (e) {
      console.error("Error sending message:", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(`Error communicating with Ollama: ${errorMessage}`);
      const errorAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error during the chat: ${errorMessage}`,
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
      setCurrentAssistantMessage(null);
    }
  };
  
  const setOllamaApiUrl = (url: string) => {
    setOllamaApiUrlState(url);
  };


  const stopGeneration = () => {
    setIsLoading(false);
    setCurrentAssistantMessage(null);
  };

  return (
    <OllamaContext.Provider value={{
      models,
      selectedModel,
      setSelectedModelByName,
      systemPrompt,
      setSystemPrompt,
      chatHistory,
      currentAssistantMessage,
      sendMessage,
      isLoading,
      error,
      clearChat,
      fetchModels,
      ollamaApiUrl,
      setOllamaApiUrl,
    }}>
      {children}
    </OllamaContext.Provider>
  );
};
