export interface ReadableUser {
  id: number;
  name: string;
  gender: boolean;
  dateOfBirth: Date;
  emailAddress: string;
  username: string;
  anonymous: boolean;
  roles: string[];
}
