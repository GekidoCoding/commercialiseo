import {PromotionRead} from './promotion-read';

export interface VariantRead {
  _id?: string; // ObjectId MongoDB

  code: string;

  stock: number;

  userId: string;

  price: number;

  specificAttributes: Record<string, any>;

  lastUpdated: Date;

  promotions: PromotionRead[];

  images: any[];
  isMain: boolean;
}
