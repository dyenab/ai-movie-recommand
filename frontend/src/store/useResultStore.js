import { create } from "zustand";

const useResultStore = create((set) => ({
  aiResponse: "",
  setAiResponse: (response) => set({ aiResponse: response }),
}));

export default useResultStore;
