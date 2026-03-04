import { Component, OnInit, OnDestroy ,ChangeDetectorRef  } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ToastService } from '../../../../shared/services/toast.service';
import { ProductRead } from '../../../../shared/model/product-read';
import { VariantRead } from '../../../../shared/model/variant-read';
import { PromotionRead } from '../../../../shared/model/promotion-read';
import {PublicService} from '../../../../shared/services/public.service';
import {AcheteurService} from '../../services/acheteur.service';
import {environment} from '../../../../../environments/environment';
import {CartItem} from '../../model/cart-item';
import {CartEventService} from '../../services/cart-event-service';


interface FilterCriteria {
  searchTerm: string;
  minPrice: number | null;
  maxPrice: number | null;
  category: string;
  inStockOnly: boolean;
  hasPromotionOnly: boolean;
  attributes: { key: string; value: string }[];
}
@Component({
  selector: 'app-products-list-acheteur',
  templateUrl: './products-list-acheteur.component.html',
  styleUrls: ['./products-list-acheteur.component.css'],
  standalone: false
})
export class ProductsListAcheteurComponent implements OnInit, OnDestroy {
  serveurUrl = environment.apiUrl;
  placeholderProductImageUrl = 'assets/images/placeholder-product.png';
  // Données
  allProducts: ProductRead[] = [];
  filteredProducts: ProductRead[] = [];
  categories: string[] = [];
  isLoading: boolean = true;

  // Recherche globale
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Toggle filtres avancés
  showFilters: boolean = false;

  // Critères de filtrage multi-critères
  filters: FilterCriteria = {
    searchTerm: '',
    minPrice: null,
    maxPrice: null,
    category: '',
    inStockOnly: false,
    hasPromotionOnly: false,
    attributes: []
  };

  // Pré-sélection active
  activePreset: string | null = null;

  // Quantités pour chaque variant (clé = variant._id)
  variantQuantities: { [key: string]: number } = {};

  // Stock initial des variants (pour calculer le vrai stock disponible)
  private initialStockMap: { [key: string]: number } = {};

  constructor(
    private acheteurService: AcheteurService,
    private toastr: ToastService,
    private cdr :ChangeDetectorRef,
    private cartEventService: CartEventService

  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== CHARGEMENT DES DONNÉES ====================

  loadProducts(): void {
    this.isLoading = true;
    this.cdr.detectChanges(); // Force detection pour afficher le loading
    
    this.acheteurService.findAllProductsForClient()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.allProducts = response.data;
            // Sauvegarder les stocks initiaux
            this.saveInitialStocks();
            this.filteredProducts = [...this.allProducts];
            this.extractCategories();
            this.applyFilters();
          } else {
            this.toastr.error('Erreur lors du chargement des produits');
          }
          this.isLoading = false;
          this.cdr.detectChanges(); // Force detection après chargement
        },
        error: (error) => {
          this.toastr.error('Erreur de connexion au serveur');
          this.isLoading = false;
          this.cdr.detectChanges(); // Force detection après erreur
        }
      });
  }

  /**
   * Sauvegarde les stocks initiaux de tous les variants
   */
  private saveInitialStocks(): void {
    this.allProducts.forEach(product => {
      product.variants?.forEach(variant => {
        const key = variant._id || variant.code;
        this.initialStockMap[key] = variant.stock;
      });
    });
  }

  /**
   * Récupère le stock initial d'un variant
   */
  private getInitialStock(variant: VariantRead): number {
    const key = variant._id || variant.code;
    return this.initialStockMap[key] || variant.stock;
  }

  extractCategories(): void {
    const categorySet = new Set<string>();
    this.allProducts.forEach(product => {
      if (product.category && typeof product.category === 'object' && product.category.name) {
        categorySet.add(product.category.name);
      } else if (product.category && typeof product.category === 'string') {
        categorySet.add(product.category);
      }
    });
    this.categories = Array.from(categorySet).sort();
  }

  // ==================== RECHERCHE GLOBALE INTELLIGENTE ====================

  setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.filters.searchTerm = term;
      this.applyFilters();
      this.cdr.detectChanges(); // Force detection après recherche
    });
  }

  onSearchInput(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filters.searchTerm = '';
    this.applyFilters();
  }

  // ==================== FILTRES MULTI-CRITÈRES ====================

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    this.cdr.detectChanges(); // Force detection après toggle
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  addAttributeFilter(): void {
    this.filters.attributes.push({ key: '', value: '' });
    this.cdr.detectChanges(); // Force detection après ajout
  }

  removeAttributeFilter(index: number): void {
    this.filters.attributes.splice(index, 1);
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.filters = {
      searchTerm: this.searchTerm,
      minPrice: null,
      maxPrice: null,
      category: '',
      inStockOnly: false,
      hasPromotionOnly: false,
      attributes: []
    };
    this.applyFilters();
  }

  // ==================== LOGIQUE DE FILTRAGE ====================

  applyFilters(): void {
    let result = [...this.allProducts];

    // Recherche globale intelligente
    if (this.filters.searchTerm.trim()) {
      const searchLower = this.filters.searchTerm.toLowerCase();
      result = result.filter(product => {
        const productMatch =
          (product.product?.name?.toLowerCase().includes(searchLower)) ||

          (product.category?.name?.toLowerCase().includes(searchLower)) ||
          (typeof product.category === 'string' && product.category.toLowerCase().includes(searchLower));

        const variantMatch = product.variants?.some(variant =>
          variant.code?.toLowerCase().includes(searchLower) ||
          Object.entries(variant.specificAttributes || {}).some(([key, val]) =>
            key.toLowerCase().includes(searchLower) ||
            String(val).toLowerCase().includes(searchLower)
          )
        );

        return productMatch || variantMatch;
      });
    }

    // Filtre par catégorie
    if (this.filters.category) {
      result = result.filter(product => {
        const catName = typeof product.category === 'object' ? product.category?.name : product.category;
        return catName === this.filters.category;
      });
    }

    // Filtre par prix (sur les variants)
    if (this.filters.minPrice !== null || this.filters.maxPrice !== null) {
      result = result.filter(product => {
        return product.variants?.some(variant => {
          const effectivePrice = this.getEffectivePrice(variant);
          const minOk = this.filters.minPrice === null || effectivePrice >= this.filters.minPrice;
          const maxOk = this.filters.maxPrice === null || effectivePrice <= this.filters.maxPrice;
          return minOk && maxOk;
        });
      });
    }

    // Filtre stock disponible
    if (this.filters.inStockOnly) {
      result = result.filter(product =>
        product.variants?.some(variant => variant.stock > 0)
      );
    }

    // Filtre promotions actives
    if (this.filters.hasPromotionOnly) {
      result = result.filter(product =>
        product.variants?.some(variant => this.getActivePromotion(variant) !== null)
      );
    }

    // Filtre par attributs spécifiques
    if (this.filters.attributes.length > 0) {
      const validAttributes = this.filters.attributes.filter(attr => attr.key && attr.value);
      if (validAttributes.length > 0) {
        result = result.filter(product =>
          product.variants?.some(variant =>
            validAttributes.every(attr => {
              const variantValue = variant.specificAttributes?.[attr.key];
              return variantValue !== undefined &&
                String(variantValue).toLowerCase() === attr.value.toLowerCase();
            })
          )
        );
      }
    }

    this.filteredProducts = result;
    this.cdr.detectChanges(); // Force detection après filtrage
  }

  // ==================== PRÉDÉFINITIONS ====================

  setPreset(preset: string): void {
    this.activePreset = preset;
    // Pour l'instant, juste visuel - logique à implémenter plus tard
    switch (preset) {
      case 'match':
        // Meilleure correspondance - déjà par défaut
        break;
      case 'bestseller':
        // Meilleures ventes - à implémenter
        break;
      case 'price':
        // Tri par prix
        this.filteredProducts.sort((a, b) => {
          const minPriceA = Math.min(...(a.variants?.map(v => this.getEffectivePrice(v)) || [0]));
          const minPriceB = Math.min(...(b.variants?.map(v => this.getEffectivePrice(v)) || [0]));
          return minPriceA - minPriceB;
        });
        break;
    }
  }

  // ==================== HELPERS POUR L'AFFICHAGE ====================

  getActivePromotion(variant: VariantRead): PromotionRead | null {
    if (!variant.promotions || variant.promotions.length === 0) return null;

    const now = new Date();
    return variant.promotions.find(promo => {
      const begin = new Date(promo.dateBegin);
      const end = new Date(promo.dateEnd);
      return now >= begin && now <= end;
    }) || null;
  }

  getEffectivePrice(variant: VariantRead): number {
    const activePromo = this.getActivePromotion(variant);
    if (!activePromo) return variant.price;

    if (activePromo.typePromotion === 'REMISE') {
      return variant.price * (1 - activePromo.value / 100);
    } else {
      // PRICE ou DISCOUNT
      return Math.max(0, variant.price - activePromo.value);
    }
  }

  getPromotionEndTime(variant: VariantRead): string {
    const activePromo = this.getActivePromotion(variant);
    if (!activePromo) return '';

    const end = new Date(activePromo.dateEnd);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Expiré';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}j ${hours}h restantes`;
    if (hours > 0) return `${hours}h ${minutes}m restantes`;
    return `${minutes}m restantes`;
  }

  getMainImage(variant: VariantRead): string {
    if (!variant.images || variant.images.length === 0) {
      return this.placeholderProductImageUrl;
    }

    // Cherche l'image principale
    const img = variant.images.find(
      (i: any) => i.isMain === true || i.main === true
    ) || variant.images[0];

    if (!img || !img.url) {
      return this.placeholderProductImageUrl;
    }

    // Construction correcte de l'URL
    return this.serveurUrl + (img.url.startsWith('/') ? img.url : '/' + img.url);
  }

  getVariantAttributes(variant: VariantRead): { key: string; value: string }[] {
    if (!variant.specificAttributes) return [];
    return Object.entries(variant.specificAttributes).map(([key, value]) => ({
      key,
      value: Array.isArray(value) ? value.join(', ') : String(value)
    }));
  }

  trackByProductId(index: number, product: ProductRead): string {
    return product._id;
  }

  trackByVariantId(index: number, variant: VariantRead): string {
    return variant._id || variant.code;
  }

  // ==================== MÉTHODES MANQUANTES ====================

  /**
   * Compte le nombre total de variants affichés
   */
  getTotalVariantsCount(): number {
    return this.filteredProducts.reduce((total, product) => {
      return total + (product.variants?.length || 0);
    }, 0);
  }

  /**
   * Compte le nombre de filtres actuellement actifs
   */
  getActiveFiltersCount(): number {
    let count = 0;

    if (this.filters.category) count++;
    if (this.filters.minPrice !== null) count++;
    if (this.filters.maxPrice !== null) count++;
    if (this.filters.inStockOnly) count++;
    if (this.filters.hasPromotionOnly) count++;

    // Compte les attributs valides (ayant key et value non vides)
    const validAttributes = this.filters.attributes.filter(attr => attr.key && attr.value);
    count += validAttributes.length;

    return count;
  }

  /**
   * Vérifie si au moins un filtre est actif
   */
  hasActiveFilters(): boolean {
    return this.getActiveFiltersCount() > 0;
  }

  /**
   * Retourne la classe CSS pour le statut de stock
   */
  getStockStatusClass(stock: number): string {
    if (stock <= 0) return 'out-of-stock';
    if (stock <= 5) return 'low-stock';
    return 'in-stock';
  }

  /**
   * Retourne l'icône FontAwesome pour le statut de stock
   */
  getStockIcon(stock: number): string {
    if (stock <= 0) return 'fa-times-circle';
    if (stock <= 5) return 'fa-exclamation-circle';
    return 'fa-check-circle';
  }

  /**
   * Retourne le libellé pour le statut de stock avec la quantité
   */
  getStockLabel(stock: number): string {
    if (stock <= 0) return 'Rupture de stock';
    if (stock <= 5) return `Plus que ${stock} en stock`;
    return `Stock disponible (${stock})`;
  }
  /**
   * Récupère la quantité saisie pour un variant (initialise avec le panier si existe)
   */
  getVariantQuantity(variant: VariantRead): number {
    const key = variant._id || variant.code;

    if (this.variantQuantities[key] === undefined) {
      // Chercher si déjà dans le panier
      const cart = this.getVariantsPanier();
      const cartItem = cart.find(item =>
        item.variant._id === variant._id || item.variant.code === variant.code
      );

      // Initialiser avec la quantité du panier, ou 1 par défaut
      this.variantQuantities[key] = cartItem ? cartItem.quantity : 1;
    }

    return this.variantQuantities[key];
  }

  /**
   * Met à jour la quantité d'un variant (empêche les valeurs négatives)
   */
  updateVariantQuantity(variant: VariantRead, event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10) || 0;
    const key = variant._id || variant.code;

    // Calculer le stock disponible réel (stock initial - panier actuel)
    const initialStock = this.getInitialStock(variant);
    const inCart = this.getQuantityInCart(variant);
    const availableStock = initialStock - inCart;

    // Empêche les valeurs négatives et supérieures au stock disponible
    if (value < 0) value = 0;
    if (value > availableStock) value = availableStock;

    this.variantQuantities[key] = value;

    // Met à jour l'input si la valeur a été corrigée
    if (input.value !== value.toString()) {
      input.value = value.toString();
    }
  }

  /**
   * Récupère la quantité d'un variant déjà dans le panier
   */
  private getQuantityInCart(variant: VariantRead): number {
    const cart = this.getVariantsPanier();
    const cartItem = cart.find(item =>
      item.variant._id === variant._id || item.variant.code === variant.code
    );
    return cartItem ? cartItem.quantity : 0;
  }

  /**
   * Vérifie si le bouton Ajouter doit être désactivé
   */
  isAddToCartDisabled(variant: VariantRead): boolean {
    const quantity = this.getVariantQuantity(variant);
    const availableStock = this.getAvailableStock(variant);
    return availableStock <= 0 || quantity <= 0;
  }

  /**
   * Ajoute au panier et sauvegarde dans localStorage/sessionStorage
   * Puis recharge les données depuis le storage pour synchroniser
   */
  addToCart(product: ProductRead, variant: VariantRead): void {
    const quantity = this.getVariantQuantity(variant);
    const availableStock = this.getAvailableStock(variant);

    if (quantity <= 0 || availableStock < quantity) {
      this.toastr.error('Quantité invalide ou stock insuffisant');
      return;
    }

    // Créer l'item du panier
    const cartItem: CartItem = {
      productId: product._id,
      productName: product.product.name,
      variant: { ...variant }, // Clone pour éviter la référence
      quantity: quantity,
      addedAt: new Date().toISOString()
    };

    // Sauvegarder dans le panier (met à jour la quantité si existe déjà)
    this.saveToCart(cartItem);
    this.cartEventService.notifyCartUpdated();

    // RECHARGER le panier depuis le storage pour avoir les données fraîches
    const freshCart = this.getVariantsPanier();
    const freshItem = freshCart.find(item =>
      item.variant._id === variant._id || item.variant.code === variant.code
    );

    // Mettre à jour la quantité affichée avec la valeur fraîche du panier
    const key = variant._id || variant.code;
    this.variantQuantities[key] = freshItem ? freshItem.quantity : 1;

    // Mettre à jour le stock affiché du variant (stock initial - quantité dans panier)
    const initialStock = this.getInitialStock(variant);
    variant.stock = initialStock - (freshItem ? freshItem.quantity : 0);

    const confirmation = confirm(`Voulez-vous vraiment ajouter ${quantity} ${product.product.name} (${variant.code}) au panier ?`);

    if (!confirmation) return;

    // Notification de succès
    this.toastr.success(`${product.product.name} (${variant.code}) - Quantité: ${quantity} ajoutée au panier`);

    // Forcer la mise à jour de l'affichage
    this.cdr.detectChanges();
  }

  /**
   * Sauvegarde un item dans le panier (localStorage et sessionStorage)
   */
  private saveToCart(newItem: CartItem): void {
    const storageKey = 'cart_variants';

    // Récupérer le panier existant
    let cart = this.getVariantsPanier();

    // Vérifier si le variant existe déjà dans le panier
    const existingIndex = cart.findIndex(item =>
      item.variant._id === newItem.variant._id || item.variant.code === newItem.variant.code
    );

    if (existingIndex >= 0) {
      // Mettre à jour la quantité si déjà présent
      cart[existingIndex].quantity += newItem.quantity;
      cart[existingIndex].addedAt = newItem.addedAt;
    } else {
      // Ajouter le nouvel item
      cart.push(newItem);
    }

    // Sauvegarder dans les deux storages
    const cartJson = JSON.stringify(cart);
    localStorage.setItem(storageKey, cartJson);
    sessionStorage.setItem(storageKey, cartJson);
  }

  /**
   * Récupère la liste des variants du panier depuis localStorage ou sessionStorage
   */
  getVariantsPanier(): CartItem[] {
    const storageKey = 'cart_variants';

    try {
      // Essayer d'abord localStorage, puis sessionStorage
      const cartJson = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);

      if (cartJson) {
        const cart = JSON.parse(cartJson);
        return Array.isArray(cart) ? cart : [];
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error);
    }

    return [];
  }

  /**
   * Vide complètement le panier
   */
  clearCart(): void {
    const storageKey = 'cart_variants';
    localStorage.removeItem(storageKey);
    sessionStorage.removeItem(storageKey);
  }

  /**
   * Supprime un variant spécifique du panier
   */
  removeFromCart(variantId: string): void {
    const storageKey = 'cart_variants';
    let cart = this.getVariantsPanier();

    cart = cart.filter(item =>
      item.variant._id !== variantId && item.variant.code !== variantId
    );

    const cartJson = JSON.stringify(cart);
    localStorage.setItem(storageKey, cartJson);
    sessionStorage.setItem(storageKey, cartJson);
  }

  /**
   * Calcule le stock disponible en tenant compte du panier
   * Utilise le stock initial sauvegardé au chargement
   */
  getAvailableStock(variant: VariantRead): number {
    const initialStock = this.getInitialStock(variant);
    const inCart = this.getQuantityInCart(variant);
    return Math.max(0, initialStock - inCart);
  }
}
