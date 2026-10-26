export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

export interface UserPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  dob?: string;
  phone?: string;
  address?: Address;
}

export interface User extends Omit<UserPayload, 'password'> {
  id: string;
  password: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  is_rental: boolean;
  in_stock: boolean;
  category?: { id: string; name: string };
  brand?: { id: string; name: string };
}

export interface Paginated<T> {
  current_page: number;
  data: T[];
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}
