import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BoutiqueService } from '../../services/boutique.service';
import { PublicService } from '../../../../shared/services/public.service';
import { ProductRead } from '../../../../shared/model/product-read';
import { VariantRead } from '../../../../shared/model/variant-read';
import { PromotionRead } from '../../../../shared/model/promotion-read';
import { Category } from '../../../../shared/model/category';
import { Subject } from 'rxjs';
import { AuthUtilService } from '../../../../shared/services/auth-util.service';
import { VariantAddFormComponent } from '../../components/variant-add-form/variant-add-form.component';
import { VariantUpdateFormComponent } from '../../components/variant-update-form/variant-update-form.component';
import {PromotionAddFormComponent} from '../../components/promotion-add-form.component/promotion-add-form.component';
import {PromotionUpdateFormComponent} from '../../components/promotion-update-form/promotion-update-form.component';
import { PromotionType } from '../../../../shared/constants/promotion-type';

interface StatCard {
  titre: string;
  valeur: string | number;
  icone: string;
  couleur: string;
  sousTitre?: string;
}

interface FiltresAvances {
  recherche: string;
  categories: string[];
  prixMin: number | null;
  prixMax: number | null;
  stockMin: number | null;
  stockMax: number | null;
  statuts: string[];
  dateDebut: string;
  dateFin: string;
  enPromotion: boolean | null;
  attributs: { cle: string; valeur: string }[];
}

@Component({
  selector: 'app-products-list-boutique',
  templateUrl: './products-list-boutique.component.html',
  styleUrls: ['./products-list-boutique.component.css'],
  standalone: false
})
export class ProductsListBoutiqueComponent implements OnInit, OnDestroy {
  // Données
  produits: ProductRead[] = [];
  produitsFiltres: ProductRead[] = [];
  categories: Category[] = [];
  currentUserId: string = '';

  // Gestion destruction du composant
  private destroy$ = new Subject<void>();

  // Loading
  isLoading: boolean = false;
  skeletonRows: number[] = Array(5).fill(0);

  // Expansion
  expandedProducts: Set<string> = new Set();
  expandedVariants: Set<string> = new Set();

  // Filtres avancés
  filtres: FiltresAvances = {
    recherche: '',
    categories: [],
    prixMin: null,
    prixMax: null,
    stockMin: null,
    stockMax: null,
    statuts: [],
    dateDebut: '',
    dateFin: '',
    enPromotion: null,
    attributs: []
  };

  showFilters: boolean = false;

  // Statistiques
  statsCards: StatCard[] = [];
  statsGlobales = {
    totalProduits: 0,
    totalVariants: 0,
    totalStock: 0,
    valeurStockTotal: 0,
    moyennePrix: 0,
    produitsEnPromotion: 0,
    variantsEnPromotion: 0,
    stockFaible: 0,
    ruptureStock: 0
  };

  // Pagination
  pageActuelle: number = 1;
  itemsParPage: number = 10;
  totalPages: number = 1;

  // Tri
  sortColumn: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private boutiqueService: BoutiqueService,
    private publicService: PublicService,
    private authService: AuthUtilService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserFromStorage()?.id || '';
    console.log("currentUser:", JSON.stringify(this.authService.getUserFromStorage(), null, 2));
    this.chargerCategories();
    this.chargerProduits();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== CHARGEMENT DES DONNÉES ====================

  chargerCategories(): void {
    this.publicService.findAllCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data || [];
        }
      }
    });
  }

  chargerProduits(): void {
    this.isLoading = true;
    console.log("userId in charging products boutique :" + this.currentUserId);
    this.boutiqueService.findAllProductsForUser(this.currentUserId)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            console.log("products in boutique :" + JSON.stringify(response));
            this.produits = response.data;
            this.isLoading = false;
            this.appliquerFiltres();
            this.calculerStatistiques();
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Erreur chargement produits:', error);
        }
      });
  }

  // ==================== FILTRES AVANCÉS ====================

  appliquerFiltres(): void {
    let resultats = [...this.produits];

    if (this.filtres.recherche.trim()) {
      const terme = this.filtres.recherche.toLowerCase();
      resultats = resultats.filter(p =>
        p.product.name?.toLowerCase().includes(terme) ||
        p.product.code?.toLowerCase().includes(terme) ||
        JSON.stringify(p.product.specs)?.toLowerCase().includes(terme)
      );
    }

    if (this.filtres.categories.length > 0) {
      resultats = resultats.filter(p =>
        this.filtres.categories.includes(p.category._id)
      );
    }

    if (this.filtres.prixMin !== null || this.filtres.prixMax !== null) {
      resultats = resultats.filter(p => {
        const variantsUser = this.getUserVariants(p);
        return variantsUser.some(v => {
          const prix = this.getPrixEffectif(v);
          const minOk = this.filtres.prixMin === null || prix >= this.filtres.prixMin;
          const maxOk = this.filtres.prixMax === null || prix <= this.filtres.prixMax;
          return minOk && maxOk;
        });
      });
    }

    if (this.filtres.stockMin !== null || this.filtres.stockMax !== null) {
      resultats = resultats.filter(p => {
        const variantsUser = this.getUserVariants(p);
        return variantsUser.some(v => {
          const minOk = this.filtres.stockMin === null || v.stock >= this.filtres.stockMin;
          const maxOk = this.filtres.stockMax === null || v.stock <= this.filtres.stockMax;
          return minOk && maxOk;
        });
      });
    }

    if (this.filtres.statuts.length > 0) {
      resultats = resultats.filter(p => {
        const variantsUser = this.getUserVariants(p);
        return variantsUser.some(v => {
          const statut = this.getStatutFromStock(v.stock);
          return this.filtres.statuts.includes(statut);
        });
      });
    }

    if (this.filtres.dateDebut) {
      const dateDebut = new Date(this.filtres.dateDebut);
      resultats = resultats.filter(p => new Date(p.product.releaseDate) >= dateDebut);
    }
    if (this.filtres.dateFin) {
      const dateFin = new Date(this.filtres.dateFin);
      resultats = resultats.filter(p => new Date(p.product.releaseDate) <= dateFin);
    }

    if (this.filtres.enPromotion !== null) {
      resultats = resultats.filter(p => {
        const variantsUser = this.getUserVariants(p);
        const aPromotion = variantsUser.some(v => this.hasActivePromotion(v));
        return this.filtres.enPromotion ? aPromotion : !aPromotion;
      });
    }

    if (this.filtres.attributs.length > 0) {
      resultats = resultats.filter(p => {
        const variantsUser = this.getUserVariants(p);
        return variantsUser.some(v => {
          return this.filtres.attributs.every(attr => {
            if (!attr.cle || !attr.valeur) return true;
            return v.specificAttributes?.[attr.cle]?.toString().toLowerCase()
              .includes(attr.valeur.toLowerCase());
          });
        });
      });
    }

    resultats = this.trierProduits(resultats);

    this.produitsFiltres = resultats;
    this.calculerPagination();
    this.pageActuelle = 1;
  }

  trierProduits(produits: ProductRead[]): ProductRead[] {
    return produits.sort((a, b) => {
      let valA: any, valB: any;

      switch (this.sortColumn) {
        case 'name':
          valA = a.product.name;
          valB = b.product.name;
          break;
        case 'code':
          valA = a.product.code;
          valB = b.product.code;
          break;
        case 'category':
          valA = a.category.name;
          valB = b.category.name;
          break;
        case 'date':
          valA = new Date(a.product.releaseDate);
          valB = new Date(b.product.releaseDate);
          break;
        case 'stock':
          valA = this.getTotalStockUser(a);
          valB = this.getTotalStockUser(b);
          break;
        default:
          valA = a.product.name;
          valB = b.product.name;
      }

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  changerTri(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.appliquerFiltres();
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // ==================== STATISTIQUES COMPLEXES ====================

  calculerStatistiques(): void {
    const allUserVariants: VariantRead[] = [];

    this.produits.forEach(p => {
      allUserVariants.push(...this.getUserVariants(p));
    });

    this.statsGlobales.totalProduits = this.produits.length;
    this.statsGlobales.totalVariants = allUserVariants.length;
    this.statsGlobales.totalStock = allUserVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
    this.statsGlobales.valeurStockTotal = allUserVariants.reduce((sum, v) => {
      const prix = this.getPrixEffectif(v);
      return sum + (prix * (v.stock || 0));
    }, 0);
    this.statsGlobales.moyennePrix = allUserVariants.length > 0
      ? allUserVariants.reduce((sum, v) => sum + this.getPrixEffectif(v), 0) / allUserVariants.length
      : 0;

    this.statsGlobales.variantsEnPromotion = allUserVariants.filter(v => this.hasActivePromotion(v)).length;
    this.statsGlobales.produitsEnPromotion = this.produits.filter(p =>
      this.getUserVariants(p).some(v => this.hasActivePromotion(v))
    ).length;

    this.statsGlobales.stockFaible = allUserVariants.filter(v => v.stock > 0 && v.stock <= 10).length;
    this.statsGlobales.ruptureStock = allUserVariants.filter(v => v.stock === 0).length;

    const statsParCategorie = this.categories.map(cat => {
      const produitsCat = this.produits.filter(p => p.category._id === cat._id);
      const variantsCat = produitsCat.flatMap(p => this.getUserVariants(p));
      return {
        categorie: cat.name,
        count: variantsCat.length,
        stockTotal: variantsCat.reduce((sum, v) => sum + v.stock, 0)
      };
    });

    this.statsCards = [
      {
        titre: 'Total Variants',
        valeur: this.statsGlobales.totalVariants,
        icone: 'fa-cubes',
        couleur: 'primary',
        sousTitre: `${this.statsGlobales.totalProduits} produits`
      },
      {
        titre: 'Valeur du Stock',
        valeur: this.formatMontant(this.statsGlobales.valeurStockTotal),
        icone: 'fa-euro-sign',
        couleur: 'success',
        sousTitre: `${this.statsGlobales.totalStock} unités`
      },
      {
        titre: 'En Promotion',
        valeur: this.statsGlobales.variantsEnPromotion,
        icone: 'fa-percent',
        couleur: 'warning',
        sousTitre: `${this.statsGlobales.produitsEnPromotion} produits`
      },
      {
        titre: 'Stock Faible/Rupture',
        valeur: `${this.statsGlobales.stockFaible} / ${this.statsGlobales.ruptureStock}`,
        icone: 'fa-exclamation-triangle',
        couleur: 'danger',
        sousTitre: 'Alertes stock'
      },
      {
        titre: 'Prix Moyen',
        valeur: this.formatMontant(this.statsGlobales.moyennePrix),
        icone: 'fa-chart-line',
        couleur: 'info',
        sousTitre: 'Tous variants'
      },
      {
        titre: 'Catégories Actives',
        valeur: statsParCategorie.filter(c => c.count > 0).length,
        icone: 'fa-folder-open',
        couleur: 'secondary',
        sousTitre: `${this.categories.length} total`
      }
    ];
  }

  // ==================== UTILITAIRES ====================

  getUserVariants(produit: ProductRead): VariantRead[] {
    return produit.variants?.filter(v => v.userId === this.currentUserId) || [];
  }

  getPrixEffectif(variant: VariantRead): number {
    const promo = this.getActivePromotion(variant);
    if (promo) {
      if (promo.typePromotion === PromotionType.REMISE) {
        return variant.price * (1 - promo.value / 100);
      } else {
        // PRICE et DISCOUNT : montant fixe à déduire
        return Math.max(0, variant.price - promo.value);
      }
    }
    return variant.price;
  }

  /**
   * Retourne le label formaté d'une promotion selon son type
   */
  getPromotionLabel(promo: PromotionRead): string {
    switch (promo.typePromotion) {
      case PromotionType.REMISE:
        return `-${promo.value}%`;
      case PromotionType.PRICE:
        return `${promo.value}Ar`; // Prix fixe
      case PromotionType.DISCOUNT:
        return `-${promo.value}Ar`; // Remise fixe avec moins
      default:
        return `-${promo.value}Ar`;
    }
  }

  /**
   * Retourne la classe CSS pour le badge de promotion selon le type
   */
  getPromotionBadgeClass(promo: PromotionRead): string {
    switch (promo.typePromotion) {
      case PromotionType.REMISE:
        return 'promo-percentage';
      case PromotionType.PRICE:
        return 'promo-fixed';
      case PromotionType.DISCOUNT:
        return 'promo-discount';
      default:
        return 'promo-default';
    }
  }

  getActivePromotion(variant: VariantRead): PromotionRead | null {
    const now = new Date();
    return variant.promotions?.find(p => {
      const debut = new Date(p.dateBegin);
      const fin = new Date(p.dateEnd);
      return now >= debut && now <= fin;
    }) || null;
  }

  hasActivePromotion(variant: VariantRead): boolean {
    return this.getActivePromotion(variant) !== null;
  }

  isPromotionActive(promo: PromotionRead): boolean {
    const now = new Date();
    const debut = new Date(promo.dateBegin);
    const fin = new Date(promo.dateEnd);
    return now >= debut && now <= fin;
  }

  getStatutFromStock(stock: number): string {
    if (stock === 0) return 'rupture';
    if (stock <= 10) return 'stock_faible';
    return 'en_stock';
  }

  getTotalStockUser(produit: ProductRead): number {
    return this.getUserVariants(produit).reduce((sum, v) => sum + (v.stock || 0), 0);
  }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  }

  // ==================== EXPANSION ====================

  toggleProduct(productId: string): void {
    if (this.expandedProducts.has(productId)) {
      this.expandedProducts.delete(productId);
    } else {
      this.expandedProducts.add(productId);
    }
  }

  isProductExpanded(productId: string): boolean {
    return this.expandedProducts.has(productId);
  }

  toggleVariant(variantId: string): void {
    if (this.expandedVariants.has(variantId)) {
      this.expandedVariants.delete(variantId);
    } else {
      this.expandedVariants.add(variantId);
    }
  }

  isVariantExpanded(variantId: string): boolean {
    return this.expandedVariants.has(variantId);
  }

  // ==================== PAGINATION ====================

  calculerPagination(): void {
    this.totalPages = Math.ceil(this.produitsFiltres.length / this.itemsParPage) || 1;
  }

  get produitsPagines(): ProductRead[] {
    const debut = (this.pageActuelle - 1) * this.itemsParPage;
    return this.produitsFiltres.slice(debut, debut + this.itemsParPage);
  }

  changerPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageActuelle = page;
    }
  }

  getPagesVisibles(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, this.pageActuelle - 1);
      let end = Math.min(this.totalPages - 1, this.pageActuelle + 1);

      if (this.pageActuelle <= 3) end = Math.min(this.totalPages - 1, 4);
      if (this.pageActuelle >= this.totalPages - 2) start = Math.max(2, this.totalPages - 3);

      if (start > 2) pages.push(-1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < this.totalPages - 1) pages.push(-1);
      pages.push(this.totalPages);
    }
    return pages;
  }

  // ==================== ACTIONS MODALS ====================

  openAddVariantModal(): void {
    const modalRef = this.modalService.open(VariantAddFormComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.result.then((result) => {
      if (result === 'saved') {
        this.chargerProduits();
      }
    }, () => {});
  }

  openUpdateVariantModal(variant: VariantRead, product: ProductRead): void {
    const modalRef = this.modalService.open(VariantUpdateFormComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.variant = variant;
    modalRef.componentInstance.product = product;

    modalRef.result.then((result) => {
      if (result === 'saved') {
        this.chargerProduits();
      }
    }, () => {});
  }

  openAddPromotionModal(variant: VariantRead): void {
    const modalRef = this.modalService.open(PromotionAddFormComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.variant = variant;

    modalRef.result.then((result) => {
      if (result === 'saved') {
        this.chargerProduits();
      }
    }, () => {});
  }

  openUpdatePromotionModal(promotion: PromotionRead, variant: VariantRead): void {
    const modalRef = this.modalService.open(PromotionUpdateFormComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.promotion = promotion;
    modalRef.componentInstance.variant = variant;

    modalRef.result.then((result) => {
      if (result === 'saved') {
        this.chargerProduits();
      }
    }, () => {});
  }

  supprimerPromotion(promotionId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
      this.boutiqueService.deletePromotion(promotionId).subscribe({
        next: (response) => {
          if (response.success) {
            this.chargerProduits();
          }
        }
      });
    }
  }

  supprimerVariant(variantId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce variant ?')) {
      this.boutiqueService.deleteVariant(variantId).subscribe({
        next: (response) => {
          if (response.success) {
            this.chargerProduits();
          }
        }
      });
    }
  }

  // ==================== GESTION FILTRES ====================

  toggleFiltreCategorie(catId: string): void {
    const index = this.filtres.categories.indexOf(catId);
    if (index > -1) {
      this.filtres.categories.splice(index, 1);
    } else {
      this.filtres.categories.push(catId);
    }
    this.appliquerFiltres();
  }

  toggleFiltreStatut(statut: string): void {
    const index = this.filtres.statuts.indexOf(statut);
    if (index > -1) {
      this.filtres.statuts.splice(index, 1);
    } else {
      this.filtres.statuts.push(statut);
    }
    this.appliquerFiltres();
  }

  ajouterFiltreAttribut(): void {
    this.filtres.attributs.push({ cle: '', valeur: '' });
  }

  supprimerFiltreAttribut(index: number): void {
    this.filtres.attributs.splice(index, 1);
    this.appliquerFiltres();
  }

  reinitialiserFiltres(): void {
    this.filtres = {
      recherche: '',
      categories: [],
      prixMin: null,
      prixMax: null,
      stockMin: null,
      stockMax: null,
      statuts: [],
      dateDebut: '',
      dateFin: '',
      enPromotion: null,
      attributs: []
    };
    this.appliquerFiltres();
  }

  exporterResultats(): void {
    const data = this.produitsFiltres.map(p => ({
      produit: p.product.name,
      code: p.product.code,
      categorie: p.category.name,
      variants: this.getUserVariants(p).map(v => ({
        code: v.code,
        stock: v.stock,
        prix: v.price,
        prixEffectif: this.getPrixEffectif(v),
        enPromotion: this.hasActivePromotion(v)
      }))
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-produits-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  }
}
