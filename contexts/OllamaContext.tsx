import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { OllamaModel, Message, OllamaContextType, OllamaChatRequestBody } from '../types';
import { OLLAMA_API_BASE_URL } from '../constants';
import { fetchModels as apiFetchModels, streamChat as apiStreamChat } from '../services/ollamaService';
import db, { Chat } from '../lib/db';

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
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | undefined>();
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const stopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      // Don't clear the current message, let it stay where it was cut off
      if (currentAssistantMessage) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: currentAssistantMessage,
          timestamp: new Date(),
        };
        setChatHistory(prev => [...prev, assistantMessage]);
        setCurrentAssistantMessage(null);
      }
    }
  }, [abortController, currentAssistantMessage]);

  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedModels = await apiFetchModels(ollamaApiUrl);
      setModels(fetchedModels);
      if (fetchedModels.length > 0) {
        if (!selectedModel) {
          setSelectedModel(fetchedModels.find(m => m.name === fetchedModels[2].name) || fetchedModels[0]);
        } else {
          const currentModel = fetchedModels.find(m => m.name === selectedModel.name);
          setSelectedModel(currentModel || fetchedModels[0]);
        }
      } else {
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
    setCurrentChatId(null);
    setError(null); 
  };

  const sendMessage = async (userPrompt: string) => {
    if (!selectedModel || !userPrompt.trim()) {
      setError("Please select a model and enter a prompt.");
      return;
    }

    // Abort any existing generation
    if (abortController) {
      abortController.abort();
    }

    const newController = new AbortController();
    setAbortController(newController);
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
      const signal = newController.signal;
      for await (const chunk of apiStreamChat(ollamaApiUrl, requestBody)) {
        if (signal.aborted) {
          break;
        }
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
      
      if (!signal.aborted) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date(),
        };
        setChatHistory(prev => [...prev, assistantMessage]);
      }

    } catch (e) {
      if ((e as any)?.name === 'AbortError') {
        // Ignore abort errors
        return;
      }
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
      setAbortController(null);
      setIsLoading(false);
      setCurrentAssistantMessage(null);
    }
  };
  
  const setOllamaApiUrl = (url: string) => {
    setOllamaApiUrlState(url);
  };



//this 
  const saveChat = async () => {
    if (!selectedModel || chatHistory.length === 0) return;

    const chat: Chat = {
      id: currentChatId,
      title: chatHistory[0].content.slice(0, 30) + '...',
      messages: chatHistory
        .filter((msg): msg is Message & { role: 'user' | 'assistant' } => msg.role === 'user' || msg.role === 'assistant'),
      modelId: selectedModel.name,
      createdAt: (() => {
        if (currentChatId) {
          // Try to find the existing chat's createdAt date
          const existingChat = chats.find(c => c.id === currentChatId);
          return existingChat ? existingChat.createdAt : new Date();
        }
        return new Date();
      })(),
      lastUpdated: new Date()
    };

    try {
      const id = await db.saveChat(chat);
      setCurrentChatId(id);
      // Refresh the chat list
      const loadedChats = await db.getAllChats();
      setChats(loadedChats);
    } catch (error) {
      console.error('Failed to save chat:', error);
      setError('Failed to save chat to database');
    }
  };

  // Modify the loadChats function to use the new database method
  const loadChats = async () => {
    try {
      const loadedChats = await db.getAllChats();
      setChats(loadedChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
      setError('Failed to load chats from database');
    }
  };

  const loadChat = async (id: number) => {
    try {
      const chat = await db.getChat(id);
      if (chat) {
        setChatHistory(chat.messages);
        setCurrentChatId(id);
        if (chat.modelId) {
          setSelectedModelByName(chat.modelId);
        }
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
      setError('Failed to load chat from database');
    }
  };

  // Add debounced save effect
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (chatHistory.length > 0) {
        saveChat();
      }
    }, 1000); // Debounce saves to prevent too frequent database updates

    return () => clearTimeout(saveTimeout);
  }, [chatHistory]);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  // Modify the deleteChat function
  const deleteChat = async (id: number) => {
    try {
      await db.deleteChat(id);
      if (currentChatId === id) {
        clearChat();
        setCurrentChatId(undefined);
      }
      // Refresh the chat list
      loadChats();
    } catch (error) {
      console.error('Failed to delete chat:', error);
      setError('Failed to delete chat from database');
    }
  };

  // Return value includes stopGeneration
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
      chats,
      loadChat,
      loadChats,
      deleteChat,
      currentChatId,
      stopGeneration
    }}>
      {children}
    </OllamaContext.Provider>
  );
};
