export interface ReadableUser {
  id: number;
  name: string;
  gender: boolean | null;
  dateOfBirth: string | Date | null;
  emailAddress: string;
  username: string;
  anonymous: boolean;
  role: any[]; // Array of strings or objects with name property
}
