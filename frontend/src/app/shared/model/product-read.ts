import {VariantRead} from './variant-read';

export interface ProductRead {
  _id: string;
  category: any;
  product: any;
  variants: VariantRead[];
}
