// app/dashboard/types.ts

export type MetricKey =
  | "commentsToday"
  | "commentsWeek"
  | "commentsMonth"
  | "streak"
  | "momentum"
  | string; // allow future metrics

export type MetricConfig = {
  key: MetricKey;
  label: string;
  value: string | number;
  description: string;
  userId?: string;     // <-- optional for non-radar metrics
};
