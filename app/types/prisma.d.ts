declare namespace PrismaTypes {
  interface ContentOrderByWithRelationInput {
    createdAt?: "asc" | "desc";
    updatedAt?: "asc" | "desc";
    featuredRank?: "asc" | "desc";
  }

  interface ContentCreateInput {
    genre?: string;
    director?: string;
    year?: string;
    country?: string;
    language?: string;
    cast?: string;
    isFeatured?: boolean;
    isNew?: boolean;
    featuredRank?: number;
    rejectionReason?: string;
  }

  interface ContentUpdateInput {
    genre?: string;
    director?: string;
    year?: string;
    country?: string;
    language?: string;
    cast?: string;
    isFeatured?: boolean;
    isNew?: boolean;
    featuredRank?: number;
    rejectionReason?: string;
  }

  interface UserSelect {
    isVerified?: boolean;
  }
}
