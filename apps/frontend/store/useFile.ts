import { create } from "zustand";

type State = {
  file: {
    content: string | null
    path: string | null
  }
}

type Action = {
  setFile: (content: string, path: string) => void
}

export const useFile = create<State & Action>((set) => ({
  file: {
    content: null,
    path: null
  },
  setFile: (content: string, path: string) => set(() => ({ file: { content, path } }))
}))
