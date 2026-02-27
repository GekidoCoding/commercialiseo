export interface PromotionRead {
  _id?: string;

  value: number;

  typePromotion: string;

  dateBegin: Date;

  dateEnd: Date;

  createdAt?: Date;
}
