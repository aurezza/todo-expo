import { create } from 'zustand';

export type CallRecording = {
  id: string;
  chatId: string; // The user/chat ID this call belongs to
  duration: number; // in seconds
  timestamp: string;
  videoUrl: string; // Dummy URL for now
};

type CallStore = {
  recordings: CallRecording[];
  saveRecording: (recording: Omit<CallRecording, 'id'>) => void;
};

export const useCallStore = create<CallStore>((set) => ({
  recordings: [],
  saveRecording: (recordingData) => {
    const newRecording: CallRecording = {
      id: Date.now().toString(),
      ...recordingData,
    };
    set((state) => ({
      recordings: [newRecording, ...state.recordings], // Newest first
    }));
  },
}));
