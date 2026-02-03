export type Intensity = "light" | "balanced" | "aggressive";

export type GoalsSetupClientProps = {
  userId: string;
  initialGoals: {
    intensity: Intensity;
    dailyEnabled: boolean;
    weeklyEnabled: boolean;
    dailyComments: string;
    weeklyPosts: string;
  };
};