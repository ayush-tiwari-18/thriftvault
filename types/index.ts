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
  _id? : string
  storeId: string;
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
  storeId: string;
  storeName: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  paymentIntentId: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
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
