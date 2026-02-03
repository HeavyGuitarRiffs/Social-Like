// app/dashboard/goals/types.ts

export type Goal = {
  id: string;
  text: string;
  completed: boolean;
  progress: number;
  target: number;
  due: string | null;
};

export type GoalsPayload = {
  immediate: Goal[];
  midterm: Goal[];
  longterm: Goal[];
};