
export enum UserRole {
  RETAIL_CUSTOMER = 'customer',
  RDC_STAFF = 'rdc_staff',
  LOGISTICS = 'logistics',
  HEAD_OFFICE = 'head_office'
}

export enum Region {
  NORTH = 'North',
  SOUTH = 'South',
  EAST = 'East',
  WEST = 'West',
  CENTRAL = 'Central'
}

export enum OrderStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  DISPATCHED = 'Dispatched',
  OUT_FOR_DELIVERY = 'Out for Delivery',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export interface Product {
  id: string;
  name: string;
  category: 'Packaged Food' | 'Beverages' | 'Home Cleaning' | 'Personal Care';
  price: number;
  image: string;
  description?: string;
  stock: Record<Region, number>;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: { productId: string; quantity: number; price: number }[];
  totalAmount: number;
  status: OrderStatus;
  region: Region;
  createdAt: string;
  estimatedDelivery: string;
  trackingId: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  region?: Region;
}
