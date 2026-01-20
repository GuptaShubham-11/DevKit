export interface Category {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  parentId?: Category | null;
  children?: Category[];
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  color: string;
  featuredTemplates: string[];
  clickCount: number;
  metadata: Record<string, any>;
  templateCount: number;
  createdAt: string;
  updatedAt: string;
}
