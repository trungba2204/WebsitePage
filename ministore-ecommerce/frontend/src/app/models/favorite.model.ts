export interface Favorite {
  id: number;
  userId: number;
  productId: number;
  product: Product;
  createdAt: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToFavoritesRequest {
  productId: number;
}

export interface RemoveFromFavoritesRequest {
  productId: number;
}
