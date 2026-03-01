import {VariantRead} from './variant-read';
import {Product} from './product';

export interface ProductRead {
  _id: string;
  category: any;
  product: Product;
  quantity: number;
  variants: VariantRead[];
}
