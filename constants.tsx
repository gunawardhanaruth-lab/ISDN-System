
import { Product, Region, UserRole, OrderStatus } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Island Rice 5kg',
    category: 'Packaged Food',
    price: 1250,
    image: 'https://picsum.photos/seed/rice/400/300',
    stock: { [Region.NORTH]: 500, [Region.SOUTH]: 400, [Region.EAST]: 300, [Region.WEST]: 450, [Region.CENTRAL]: 1000 }
  },
  {
    id: 'p2',
    name: 'Coconut Milk 1L',
    category: 'Beverages',
    price: 450,
    image: 'https://picsum.photos/seed/milk/400/300',
    stock: { [Region.NORTH]: 200, [Region.SOUTH]: 600, [Region.EAST]: 150, [Region.WEST]: 300, [Region.CENTRAL]: 800 }
  },
  {
    id: 'p3',
    name: 'Lemon Fresh Cleaner',
    category: 'Home Cleaning',
    price: 850,
    image: 'https://picsum.photos/seed/cleaner/400/300',
    stock: { [Region.NORTH]: 100, [Region.SOUTH]: 100, [Region.EAST]: 100, [Region.WEST]: 100, [Region.CENTRAL]: 500 }
  },
  {
    id: 'p4',
    name: 'Herbal Shampoo 200ml',
    category: 'Personal Care',
    price: 600,
    image: 'https://picsum.photos/seed/shampoo/400/300',
    stock: { [Region.NORTH]: 300, [Region.SOUTH]: 300, [Region.EAST]: 300, [Region.WEST]: 300, [Region.CENTRAL]: 600 }
  },
  {
    id: 'p5',
    name: 'Organic Tea 250g',
    category: 'Beverages',
    price: 950,
    image: 'https://picsum.photos/seed/tea/400/300',
    stock: { [Region.NORTH]: 1000, [Region.SOUTH]: 500, [Region.EAST]: 800, [Region.WEST]: 400, [Region.CENTRAL]: 1200 }
  }
];

export const MOCK_ORDERS = [
  {
    id: 'ORD-001',
    customerId: 'cust-1',
    customerName: 'QuickMart Central',
    items: [{ productId: 'p1', quantity: 10, price: 1250 }],
    totalAmount: 12500,
    status: OrderStatus.CONFIRMED,
    region: Region.CENTRAL,
    createdAt: '2024-05-10T10:00:00Z',
    estimatedDelivery: '2024-05-11',
    trackingId: 'TRK-9901'
  },
  {
    id: 'ORD-002',
    customerId: 'cust-2',
    customerName: 'Sunshine Grocers South',
    items: [{ productId: 'p2', quantity: 50, price: 450 }],
    totalAmount: 22500,
    status: OrderStatus.OUT_FOR_DELIVERY,
    region: Region.SOUTH,
    createdAt: '2024-05-09T14:00:00Z',
    estimatedDelivery: '2024-05-11',
    trackingId: 'TRK-9902'
  }
];
