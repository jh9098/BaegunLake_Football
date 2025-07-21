import create from "zustand";

export interface Child {
  id: string;
  name: string;
  grade: string;
  position: string;
  avatar?: string;
}

interface ClubState {
  children: Child[];
  addChild: (c: Omit<Child, "id">) => void;

  // (추후) user, sessions 등 추가
}

export const useClub = create<ClubState>(set => ({
  children: [],
  addChild: child =>
    set(state => ({
      children: [...state.children, { id: crypto.randomUUID(), ...child }]
    }))
}));
