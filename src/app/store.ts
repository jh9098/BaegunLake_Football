import { create } from 'zustand';
import { produce } from 'immer';

/* ---------- 타입 정의 (기획서 기반) ---------- */
export type UserRole = 'parent' | 'coach' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Child {
  id: string;
  parentId: string;
  name: string;
  grade: string;
  position: 'FW' | 'MF' | 'DF' | 'GK' | string;
  avatar?: string;
}

export interface Session {
  id: string;
  title: string;
  start: Date;
  end: Date;
  place: string;
  coachId: string;
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'pending';

export interface Attendance {
  sessionId: string;
  childId: string;
  status: AttendanceStatus;
}

export interface Metric {
  id: string;
  sessionId: string;
  childId: string;
  pass: number;
  dribble: number;
  speed: number;
  shooting: number;
  stamina: number;
  comment: string;
}

/* ---------- 초기 목업 데이터 ---------- */
const mockUser: User = { id: 'user-1', name: '김지후', role: 'parent', avatar: 'https://i.pravatar.cc/150?u=parent1' };
const mockCoach: User = { id: 'coach-1', name: '손흥민 코치', role: 'coach' };

const initialChildren: Child[] = [
  { id: 'child-1', parentId: 'user-1', name: '김민재', grade: '초4', position: 'DF', avatar: 'https://i.pravatar.cc/150?u=child1' },
  { id: 'child-2', parentId: 'user-1', name: '이강인', grade: '초5', position: 'MF', avatar: 'https://i.pravatar.cc/150?u=child2' },
];

const currentYear = new Date().getFullYear();
const initialSessions: Session[] = [
  { id: 'session-1', title: '수비 전술 훈련', coachId: 'coach-1', place: '백운호수 A구장', start: new Date(currentYear, 6, 26, 14, 0), end: new Date(currentYear, 6, 26, 16, 0) },
  { id: 'session-2', title: '주말 친선 경기 vs 의왕FC', coachId: 'coach-1', place: '갈미 축구장', start: new Date(currentYear, 6, 27, 11, 0), end: new Date(currentYear, 6, 27, 13, 0) },
];

const initialAttendance: Attendance[] = [
  { sessionId: 'session-1', childId: 'child-1', status: 'present' },
  { sessionId: 'session-1', childId: 'child-2', status: 'present' },
];

const initialMetrics: Metric[] = [
    { id: 'metric-1', sessionId: 'session-1', childId: 'child-1', pass: 75, dribble: 60, speed: 80, shooting: 65, stamina: 85, comment: "대인 방어 능력 우수. 빌드업 패스 정확도 개선 필요." },
    { id: 'metric-2', sessionId: 'session-1', childId: 'child-2', pass: 90, dribble: 95, speed: 85, shooting: 80, stamina: 80, comment: "탈압박 및 키패스 능력 발군. 수비 가담 적극성 보완." },
];

/* ---------- 스토어 ---------- */
interface ClubState {
  currentUser: User | null;
  children: Child[];
  sessions: Session[];
  attendance: Attendance[];
  metrics: Metric[];

  login: (role: UserRole) => void;
  logout: () => void;
  
  updateAttendance: (sessionId: string, childId: string, status: AttendanceStatus) => void;
  addMetric: (metricData: Omit<Metric, "id">) => void;
  
  getChildrenByParent: (parentId: string) => Child[];
  getMetricsByChild: (childId: string) => Metric[];
  getSessionById: (sessionId: string) => Session | undefined;
}

export const useClub = create<ClubState>((set, get) => ({
  currentUser: mockUser, // 기본값으로 보호자 로그인 상태
  children: initialChildren,
  sessions: initialSessions,
  attendance: initialAttendance,
  metrics: initialMetrics,

  login: (role) => set({ currentUser: role === 'parent' ? mockUser : mockCoach }),
  logout: () => set({ currentUser: null }),
  
  updateAttendance: (sessionId, childId, status) => set(produce(draft => {
    const record = draft.attendance.find(a => a.sessionId === sessionId && a.childId === childId);
    if (record) record.status = status;
    else draft.attendance.push({ sessionId, childId, status });
  })),

  addMetric: (metricData) => set(produce(draft => {
    draft.metrics.push({ id: crypto.randomUUID(), ...metricData });
  })),

  getChildrenByParent: (parentId) => get().children.filter(c => c.parentId === parentId),
  getMetricsByChild: (childId) => get().metrics.filter(m => m.childId === childId),
  getSessionById: (sessionId) => get().sessions.find(s => s.id === sessionId),
}));