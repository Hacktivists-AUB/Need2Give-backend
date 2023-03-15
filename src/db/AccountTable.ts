import { Generated } from 'kysely';

export interface AccountTable {
  id: Generated<number>;
  email: string;
  phone_number: string;
  username: string;
}
