// src/app/shared/models.ts
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Product {
  id: string;
  name?: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  tags?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
