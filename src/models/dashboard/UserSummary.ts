export interface UserSummary {
  id: string;
  adminName: string;
  adminEmail: string;
  username: string;
  createdAt: string; // ISO date
  active?: boolean;
  role?: string;
  lastAccess?: string;
}
