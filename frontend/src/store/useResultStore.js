import { create } from "zustand";

const useResultStore = create((set) => ({
  aiResponse: [],
  setAiResponse: (movies) => set({ aiResponse: movies }),
}));

export default useResultStore;
