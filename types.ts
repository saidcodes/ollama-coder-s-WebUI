export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[] | null;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaTagResponse {
  models: OllamaModel[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface OllamaChatRequestBody {
  model: string;
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  stream?: boolean;
  options?: Record<string, unknown>; // For temperature, top_p etc.
}

export interface OllamaChatStreamChunk {
  model: string;
  created_at: string;
  message: {
    role: 'assistant';
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaContextType {
  models: OllamaModel[] | null; // null if error during fetch
  selectedModel: OllamaModel | null;
  setSelectedModelByName: (name: string) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  chatHistory: Message[];
  currentAssistantMessage: string | null;
  sendMessage: (userPrompt: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearChat: () => void;
  fetchModels: () => Promise<void>;
  ollamaApiUrl: string;
  setOllamaApiUrl: (url: string) => void; // Added for potential future settings
  stopGeneration: () => void;
  //for storing the chat history
  chats: Chat[];
  loadChat: (id: number) => Promise<void>;
  loadChats: () => Promise<void>;
  deleteChat: (id: number) => Promise<void>;
  currentChatId?: number;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  // Add other grounding source types if needed
}

export interface Chat {
  id?: number;
  title: string;
  messages: Message[];
  modelId: string;
  createdAt: Date;
  lastUpdated: Date;
}

