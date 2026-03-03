/**
 * Interface pour une variante dans la requête d'achat
 */
export interface PurchaseVariant {
  variantId: string;
  quantity: number;
}

/**
 * Interface pour la requête de confirmation d'achat
 */
export interface PurchaseRequest {
  acheteurId: string;
  password: string;
  variants: PurchaseVariant[];
}

/**
 * Interface pour la réponse de confirmation d'achat
 */
export interface PurchaseResponse {
  message: string;
  success: boolean;
}
