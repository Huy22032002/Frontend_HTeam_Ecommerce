export interface Role {
  id?: number;
  name: string;
}

export interface UserSummary {
  id: string;
  username: string;
  fullName: string;
  email: string;
  active?: boolean;
  blocked?: boolean;
  role?: Role[];
  avatarUrl?: string;
  gender?: boolean;
  dateOfBirth?: string;
  createdAt?: string; // ISO timestamp from backend
}
