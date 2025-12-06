export interface ReadableCustomer {
  id: number;
  name: string;
  gender: string;
  dateOfBirth: string;
  emailAddress: string;
  username: string;
  phone: string;
  anonymous: boolean;
  blocked: boolean;
  roles: string[];
}
