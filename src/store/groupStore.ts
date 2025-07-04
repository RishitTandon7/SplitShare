import { create } from 'zustand';

export interface Member {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: Member[];
  createdAt: Date;
  totalExpenses: number;
  coverImage?: string;
}

interface GroupState {
  groups: Group[];
  currentGroup: Group | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
  updateGroup: (id: string, updatedGroup: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  setCurrentGroup: (group: Group | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  currentGroup: null,
  isLoading: false,
  error: null,

  setGroups: (groups) => set({ groups }),
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  updateGroup: (id, updatedGroup) => 
    set((state) => ({
      groups: state.groups.map((group) => 
        group.id === id ? { ...group, ...updatedGroup } : group
      ),
    })),
  deleteGroup: (id) => 
    set((state) => ({
      groups: state.groups.filter((group) => group.id !== id),
    })),
  setCurrentGroup: (group) => set({ currentGroup: group }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));