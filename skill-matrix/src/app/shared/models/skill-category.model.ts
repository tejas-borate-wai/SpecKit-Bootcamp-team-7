export interface SubCategory {
  subCategoryId: string;
  subCategoryName: string;
}

export interface SkillCategory {
  categoryId: string;
  categoryName: string;
  description: string;
  subCategories: SubCategory[];
}
