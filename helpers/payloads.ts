import creds from '../fixtures/creds';
import { UserPayload } from '../interfaces/interfaces';
import { utils } from '../utils/utils';

export function createUserPayload(overrides: Partial<UserPayload> = {}): UserPayload {
  return {
    first_name: 'Test',
    last_name: 'Customer',
    email: utils.uniqueEmail('customer'),
    password: creds.defaultPassword,
    dob: '1990-01-01',
    phone: '3331234567',
    address: {
      street: 'Via Roma 1',
      city: 'Bolzano',
      state: 'BZ',
      country: 'IT',
      postal_code: '39100',
    },
    ...overrides,
  };
}
