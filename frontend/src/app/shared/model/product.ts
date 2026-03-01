export interface Product {
  _id: string;
  name: string;
  categoryId: string;
  code: string;
  image: string;
  specs: any; // Map JSON comme dans ton backend
  releaseDate: string; // ou Date si tu veux
}
