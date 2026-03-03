import {PromotionTypeValue} from '../constants/promotion-type';

export interface Promotion{
  _id?: string;

  variantId?: string;

  value: number;

  typePromotion: PromotionTypeValue;

  dateBegin?: Date;

  dateEnd?: Date;

  duration?: number; // Durée en heures (si mode duration sélectionné)

  createdAt?: Date;
}
