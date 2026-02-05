import { create } from 'zustand';

export type Message = {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
};

type ChatStore = {
  conversations: Record<string, Message[]>;
  sendMessage: (chatId: string, text: string, sender?: 'me' | 'other') => void;
  getMessages: (chatId: string) => Message[];
};

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: {
    // Dummy initial data for specific IDs
    '1': [
      { id: '1', text: 'Hey, are we still on for the meeting?', sender: 'other', timestamp: '10:00 AM' },
      { id: '2', text: 'Yes, absolutely. 2 PM right?', sender: 'me', timestamp: '10:05 AM' },
      { id: '3', text: 'Correct. See you then!', sender: 'other', timestamp: '10:06 AM' },
    ],
  },
  sendMessage: (chatId, text, sender = 'me') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      conversations: {
        ...state.conversations,
        [chatId]: [...(state.conversations[chatId] || []), newMessage],
      },
    }));
  },
  getMessages: (chatId) => get().conversations[chatId] || [],
}));
