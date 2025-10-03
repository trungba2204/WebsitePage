export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  emailVerified?: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalBlogs: number;
  totalRevenue: number;
  ordersThisMonth: number;
  usersThisMonth: number;
}

export interface AdminTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'image' | 'action';
  width?: string;
}

export interface AdminTableAction {
  label: string;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  action: string;
  condition?: (item: any) => boolean;
}

export interface AdminFilter {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';
  value: any;
}

export interface AdminSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface AdminPagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AdminTableConfig {
  columns: AdminTableColumn[];
  actions: AdminTableAction[];
  sortable: boolean;
  filterable: boolean;
  searchable: boolean;
  pagination: boolean;
  selectable: boolean;
  pageSize: number;
  pageSizeOptions: number[];
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  stock: number;
  rating?: number;
  reviews?: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: number;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: number;
}

export interface CreateBlogRequest {
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  published: boolean;
}

export interface UpdateBlogRequest extends Partial<CreateBlogRequest> {
  id: number;
}
