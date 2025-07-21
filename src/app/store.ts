import create from "zustand";

/* ---------- 타입 ---------- */
export interface Child {
  id: string;
  name: string;
  grade: string;
  position: string;
  avatar?: string;
}

export interface Training {
  id: string;
  childId: string;
  date: string;               // 'YYYY-MM-DD'
  skill: string;              // e.g. "드리블", "패스"
  score: number;              // 0~100
  note?: string;
}

export interface EventItem {
  id: string;
  title: string;
  start: Date;
  end: Date;
  place: string;
}

/* ---------- 스토어 ---------- */
interface ClubState {
  children: Child[];
  events: EventItem[];
  trainings: Training[];

  addChild: (c: Omit<Child, "id">) => void;
  addEvent: (e: Omit<EventItem, "id">) => void;
  moveEvent: (id: string, start: Date, end: Date) => void;
  addTraining: (t: Omit<Training, "id">) => void;
}

export const useClub = create<ClubState>(set => ({
  children: [],
  events: [
    {
      id: crypto.randomUUID(),
      title: "드리블 훈련 @A구장",
      start: new Date(),
      end: new Date(new Date().setHours(new Date().getHours() + 2)),
      place: "A구장"
    }
  ],
  trainings: [],

  addChild: child =>
    set(state => ({
      children: [...state.children, { id: crypto.randomUUID(), ...child }]
    })),

  addEvent: evt =>
    set(state => ({
      events: [...state.events, { id: crypto.randomUUID(), ...evt }]
    })),

  moveEvent: (id, start, end) =>
    set(state => ({
      events: state.events.map(e =>
        e.id === id ? { ...e, start, end } : e
      )
    })),

  addTraining: tr =>
    set(state => ({
      trainings: [...state.trainings, { id: crypto.randomUUID(), ...tr }]
    }))
}));
