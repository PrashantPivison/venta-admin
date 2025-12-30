export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  sku?: string;
  slug?: string;
  image?: string;
  images?: string[];
  features?: string[];
  featured?: boolean;
  specifications?: Array<{ key: string; value: string }>;
  links?: Record<string, string>;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  stockStatus?: 'In Stock' | 'Low Stock' | 'Out of Stock';
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomProduct {
  _id: string;
  title: string;
  description: string;
  category: string;
  images?: string[];
  inquiryCount?: number;
  inquiries?: CustomOrder[];
}

export interface CustomOrder {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  description: string;
  quantity?: number;
  budget?: string;
  timeline?: string;
  attachments?: string[];
  status: 'pending' | 'reviewing' | 'quoted' | 'completed' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  recentProducts: Product[];
  latestOrders: CustomOrder[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  admin: {
    id: string;
    username: string;
  };
}

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  stock: number;
  sku?: string;
  slug?: string;
  image?: string;
  images?: File[];
  features?: string[];
  featured?: boolean;
  specifications?: Array<{ key: string; value: string }>;
  links?: Record<string, string>;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface CreateOrderData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  description: string;
  quantity?: number;
  budget?: string;
  timeline?: string;
}

export interface OrderStatusUpdate {
  status: 'pending' | 'reviewing' | 'quoted' | 'completed' | 'rejected';
  notes?: string;
}
