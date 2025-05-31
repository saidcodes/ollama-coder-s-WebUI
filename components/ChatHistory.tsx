
import { TrashIcon } from '../constants';
import { Chat } from '../lib/db';

function groupChatsByDate(chats: Chat[]) {
  const groups: { [key: string]: Chat[] } = {
    Today: [],
    Yesterday: [],
    'Last Week': [],
    'Older': []
  };

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  chats.forEach(chat => {
    const chatDate = new Date(chat.lastUpdated);
    if (chatDate.toDateString() === today.toDateString()) {
      groups.Today.push(chat);
    } else if (chatDate.toDateString() === yesterday.toDateString()) {
      groups.Yesterday.push(chat);
    } else if (chatDate > lastWeek) {
      groups['Last Week'].push(chat);
    } else {
      groups.Older.push(chat);
    }
  });

  return groups;
}

function ChatHistory({ 
  isExpanded, 
  chats, 
  currentChatId, 
  loadChat, 
  deleteChat 
}: {
  isExpanded: boolean;
  chats: Chat[];
  currentChatId: number;
  loadChat: (id: number) => void;
  deleteChat: (id: number) => void;
}) {
  const sortedChats = [...chats].sort((a, b) => 
    b.lastUpdated.getTime() - a.lastUpdated.getTime()
  );
  
  const groupedChats = groupChatsByDate(sortedChats);

  return (
    <div className="flex overflow-y-auto chat-history">
      {isExpanded && chats.length > 0 && (
        <div className="w-full">
          <h2 className="mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider px-2">
            Chat History
          </h2>
          {Object.entries(groupedChats).map(([group, groupChats]) => (
            groupChats.length > 0 && (
              <div key={group} className="mb-4">
                <h3 className="text-xs text-neutral-400 px-2 mb-1">{group}</h3>
                {groupChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`w-full flex items-center justify-between px-2 py-1.5 hover:bg-neutral-600 rounded-lg cursor-pointer transition-colors ${
                      currentChatId === chat.id ? 'bg-neutral-600' : ''
                    }`}
                  >
                    <div
                      className="flex-1 truncate mr-2"
                      onClick={() => chat.id && loadChat(chat.id)}
                    >
                      <span className="text-sm py-0.5">{chat.title}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        chat.id && deleteChat(chat.id);
                      }}
                      className="p-1 hover:bg-neutral-600 rounded"
                    >
                      <TrashIcon className="w-4 h-4 text-neutral-400" />
                    </button>
                  </div>
                ))}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatHistory;


