import { Product } from './product.model';

export interface Order {
  id: number;
  orderNumber: string;
  orderDate: Date;
  status: OrderStatus;
  totalAmount: number;
  originalAmount?: number;
  discountAmount?: number;
  discountCode?: string;
  shippingAddress: Address;
  items: OrderItem[];
  userId: number;
  paymentMethod: string;
  note?: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Address {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  ward?: string;
  postalCode?: string;
}

export interface CreateOrderRequest {
  shippingAddress: Address;
  paymentMethod: string;
  note?: string;
  discountCode?: string;
  discountAmount?: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

