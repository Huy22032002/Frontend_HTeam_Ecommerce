export interface ReadableUser {
  id: number;
  // backend returns 'username' and 'fullName' (sometimes named adminName/adminEmail in older code)
  username: string;
  fullName?: string;
  gender?: boolean;
  // dateOfBirth may come as ISO string
  dateOfBirth?: string | Date;
  // backend field name is 'email'
  email?: string;
  // optional avatar (frontend-only enhancement)
  avatar?: string;
  // roles/permissions - simplified as string array on frontend
  roles?: string[];
  active?: boolean;
}
