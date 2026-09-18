export type FaqItem = {
  question: string;
  answer: string;
};

export type SearchResult = {
  type: "template" | "blog" | "category";
  title: string;
  slug: string;
  description: string;
  href: string;
};

export type SortOption = "latest" | "popular";

export type Pagination = {
  page: number;
  pageSize: number;
};
