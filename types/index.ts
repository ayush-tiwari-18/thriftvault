export interface Store {
  id: string;
  _id?: string;
  name: string;
  description: string;
  location: string;
  bannerImage: string;
  logoImage: string;
  activeItems: number;
}

export interface Product {
  id: string;
  _id?: string;
  storeId: string; // Required for cart logic
  storeName: string;
  name: string;
  description: string;
  price: number;
  size: string;
  condition: 'New with tags' | 'Like new' | 'Good' | 'Fair';
  category: 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear' | 'Accessories' | 'Shoes';
  gender: 'Men' | 'Women' | 'Unisex';
  brand: string;
  images: string[];
  quantity: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  storeId: string | null;
  storeName: string;
  items: CartItem[];
}

export interface Order {
  id: string;
  _id?: string; // Standardize with Store and Product
  storeId: string;
  storeName: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  // Use paymentIntentId for PhonePe's ID and merchantOrderId for yours
  paymentIntentId: string; 
  merchantOrderId: string;
  // Added 'failed' and 'cancelled' to handle PhonePe webhook responses
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'failed' | 'cancelled';
  items: CartItem[];
  createdAt: string;
}

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}