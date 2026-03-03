
export const PromotionType = {
  REMISE:   'remise',
  PRICE:    'price',
  DISCOUNT: 'discount',
} as const;

export type PromotionTypeValue = typeof PromotionType[keyof typeof PromotionType];
