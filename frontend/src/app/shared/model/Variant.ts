
export interface Variant {
  _id?: string; // ObjectId MongoDB

  code: string;

  stock: number;

  userId: string;

  price: number;

  specificAttributes: Record<string, any>;

  lastUpdated: Date;

  productId: string;

  images: any[];

  isMain: boolean;
}
