export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role: string;
  gender?: string | null;
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  goal_weight?: number | null;
  step_goal: number;
  created_at: string;
  updated_at?: string | null;
}
