export interface Blog {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  authorAvatar?: string;
  publishDate: Date;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  slug: string;
  published: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface BlogCategory {
  id: number;
  name: string;
  description?: string;
  slug: string;
}

export interface BlogComment {
  id: number;
  blogId: number;
  author: string;
  authorEmail: string;
  content: string;
  publishDate: Date;
  approved: boolean;
}

export interface CreateBlogCommentRequest {
  blogId: number;
  author: string;
  authorEmail: string;
  content: string;
}
