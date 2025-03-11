import { create } from "zustand";

type State = {
  updatedFiles: Record<string, string>;
};

type Action = {
  updateDiff: (content: string, path: string) => void;
};

export const useDiff = create<State & Action>((set) => ({
  updatedFiles: {},
  updateDiff: (content, path) =>
    set((state) => ({
      updatedFiles: { ...state.updatedFiles, [path]: content },
    })),
}));
