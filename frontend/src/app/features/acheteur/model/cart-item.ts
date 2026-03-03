import {VariantRead} from '../../../shared/model/variant-read';

export interface CartItem {
  productId: string;
  productName: string;
  variant: VariantRead;
  quantity: number;
  addedAt: string;
}
