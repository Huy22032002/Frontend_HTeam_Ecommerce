export interface UserSummary {
  id: string;
  username: string;
  fullName: string;
  email: string;
  createdAt: string; // ISO date
  active?: boolean;
  role?: string;
  lastAccess?: string;
  avatarUrl?: string;
}
