import { Generated } from 'kysely';

interface AccountTable {
  id: Generated<number>;
  email: string;
  phone_number: string;
  username: string;
}

// eslint-disable-next-line import/prefer-default-export
export { AccountTable };
