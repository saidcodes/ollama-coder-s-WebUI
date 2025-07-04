import Dexie from 'dexie';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Chat {
  id?: number;
  title: string;
  messages: ChatMessage[];
  modelId: string;
  createdAt: Date;
  lastUpdated: Date;
} 

class ChatDatabase extends Dexie {
  chats!: Dexie.Table<Chat, number>;

  constructor() {
    super('OllamaChatDB');
    
    // Define indexes for better querying and persistence
    this.version(1).stores({
      chats: '++id, title, modelId, createdAt, lastUpdated'
    }).upgrade(() => {
      // Add upgrade logic if needed in the future
    });
  }

  async getAllChats(): Promise<Chat[]> {
    return await this.chats.orderBy('lastUpdated').reverse().toArray();
  }

  async saveChat(chat: Chat): Promise<number> {
    chat.lastUpdated = new Date();
    return await this.chats.put(chat);
  }

  async deleteChat(id: number): Promise<void> {
    await this.chats.delete(id);
  }

  async getChat(id: number): Promise<Chat | undefined> {
    return await this.chats.get(id);
  }
}

const db = new ChatDatabase();
export default db;