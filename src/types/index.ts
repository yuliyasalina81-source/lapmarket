export type SellerTier = "certified" | "pending";

export type ServiceKind =
  | "veterinary"
  | "grooming"
  | "training"
  | "boarding"
  | "other";

export type AnimalKind = "dog" | "cat" | "bird" | "rodent" | "other";

export type AnimalBadge = "pedigree" | "goodHands";

export type ProductCategory =
  | "Корм"
  | "Игрушки"
  | "Лежанки"
  | "Аптека";

export interface Seller {
  id: string;
  name: string;
  tier: SellerTier;
  verifiedAt?: string;
  description: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  currency: "RUB";
  image: string;
  category: ProductCategory;
  sellerId: string;
  rating: number;
}

export interface AnimalListing {
  id: string;
  name: string;
  kind: AnimalKind;
  breed?: string;
  age: string;
  city: string;
  price?: number;
  currency?: "RUB";
  image: string;
  badges: AnimalBadge[];
  description: string;
  sellerId: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  kind: ServiceKind;
  city: string;
  address: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  currency: "RUB";
  image: string;
  specialties: string[];
  verified: boolean;
}

export interface FeedPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  petName: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  createdAt: string;
  tags: string[];
}

export interface User {
  id: string;
  displayName: string;
  avatar: string;
  email: string;
  pets: string[];
  city: string;
}
