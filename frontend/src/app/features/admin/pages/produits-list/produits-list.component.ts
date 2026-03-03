import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProduitsAddFormComponent } from '../../components/produit/produits-add-form/produits-add-form.component';
import { AdminService } from '../../services/admin.service';
import {ProductRead} from '../../../../shared/model/product-read';

interface StatsAdmin {
  // Volumes
  total: number;
  enStock: number;
  stockFaible: number;
  rupture: number;
  // Pourcentages
  pctEnStock: number;
  pctStockFaible: number;
  pctRupture: number;
  // Catalogue
  nbCategories: number;
  totalStock: number;
  moyenneStock: string;
  stockMax: number;
  // Score santé (0-100)
  scoresSante: number;
  // Top catégories (max 5)
  topCategories: { nom: string; count: number; pct: number }[];
}

@Component({
  selector: 'app-produits-list',
  templateUrl: './produits-list.component.html',
  styleUrls: ['./produits-list.component.css'],
  standalone: false
})
export class ProduitsListComponent implements OnInit {
  protected readonly Math = Math;

  // Loading state
  isLoading: boolean = false;
  skeletonRows: number[] = Array(5).fill(0); // 5 lignes de skeleton

  // Statistiques admin dynamiques
  statsAdmin: StatsAdmin = {
    total: 0, enStock: 0, stockFaible: 0, rupture: 0,
    pctEnStock: 0, pctStockFaible: 0, pctRupture: 0,
    nbCategories: 0, totalStock: 0, moyenneStock: '0', stockMax: 0,
    scoresSante: 0, topCategories: []
  };

  // Liste des produits
  produits: ProductRead[] = [];
  produitsFiltres: ProductRead[] = [];

  // Filtres
  recherche: string = '';
  filtreStatut: string = 'tous';
  filtreCategorie: string = 'toutes';

  // Pagination
  pageActuelle: number = 1;
  itemsParPage: number = 10;
  totalPages: number = 1;

  // Sélection
  produitsSelectionnes: string[] = []; // Changé en string pour _id MongoDB
  selectionnerTous: boolean = false;

  // Categories uniques pour le filtre
  categories: string[] = [];

  // Message d'erreur
  errorMessage: string = '';

  constructor(
    public modalService: NgbModal,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.chargerProduits();
  }

  chargerProduits(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.findAllProducts()
      .subscribe({
        next: (response) => {
          console.log(response);
          if (response.success && response.data) {
            this.produits = response.data;
            this.extraireCategories();
            this.calculerStatistiques();
            this.appliquerFiltres();
            this.isLoading = false;
          } else {
            this.errorMessage = 'Erreur lors du chargement des produits';
          }
        },
        error: (error) => {
          this.errorMessage = error.message || 'Une erreur est survenue lors du chargement';
          console.error('Erreur chargement produits:', error);
        }
      });
  }

  calculerStatistiques(): void {
    const total = this.produits.length;
    const enStock    = this.produits.filter(p => p.quantity > 10).length;
    const stockFaible = this.produits.filter(p => p.quantity > 0 && p.quantity <= 10).length;
    const rupture    = this.produits.filter(p => p.quantity === 0).length;

    const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;

    // Stock quantités
    const quantities = this.produits.map(p => p.quantity || 0);
    const totalStock = quantities.reduce((s, q) => s + q, 0);
    const stockMax   = quantities.length > 0 ? Math.max(...quantities) : 0;
    const moyenneStock = total > 0 ? (totalStock / total).toFixed(1) : '0';

    // Score santé : 100 si tout en stock, diminue selon faible et rupture
    const scoresSante = Math.max(0, Math.round(100 - (pct(stockFaible) * 0.4) - (pct(rupture) * 1.0)));

    // Top catégories (top 5 par nb de produits)
    const catMap = new Map<string, number>();
    this.produits.forEach(p => {
      const nom = p.category?.name || 'Sans catégorie';
      catMap.set(nom, (catMap.get(nom) || 0) + 1);
    });
    const maxCatCount = Math.max(...Array.from(catMap.values()), 1);
    const topCategories = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nom, count]) => ({
        nom,
        count,
        pct: Math.round((count / maxCatCount) * 100)
      }));

    this.statsAdmin = {
      total, enStock, stockFaible, rupture,
      pctEnStock: pct(enStock),
      pctStockFaible: pct(stockFaible),
      pctRupture: pct(rupture),
      nbCategories: catMap.size,
      totalStock, stockMax,
      moyenneStock,
      scoresSante,
      topCategories
    };
  }

  extraireCategories(): void {
    console.log(this.produits);
    this.categories = [...new Set(this.produits.map(p => p.category.name))].filter(Boolean);
  }

  appliquerFiltres(): void {
    let resultats = [...this.produits];

    // Filtre recherche
    if (this.recherche.trim()) {
      const terme = this.recherche.toLowerCase();
      resultats = resultats.filter(p =>
        p.product.name?.toLowerCase().includes(terme) ||
        p.product.name?.toLowerCase().includes(terme) ||
        p.category.name?.toLowerCase().includes(terme)
      );
    }

    // Filtre statut
    if (this.filtreStatut !== 'tous') {
      resultats = resultats.filter(p => this.getStatutFromQuantite(p.quantity) === this.filtreStatut);
    }

    // Filtre categorie
    if (this.filtreCategorie !== 'toutes') {
      resultats = resultats.filter(p => p.category.name === this.filtreCategorie);
    }

    this.produitsFiltres = resultats;
    this.calculerPagination();
    this.pageActuelle = 1;
    this.produitsSelectionnes = []; // Reset sélection
    this.selectionnerTous = false;
  }

  getStatutFromQuantite(quantite: number): string {
    if (quantite === 0) return 'rupture';
    if (quantite <= 10) return 'stock_faible';
    return 'en_stock';
  }

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
      this.selectionnerTous = false;
      this.produitsSelectionnes = [];
    }
  }

  toggleSelectionTous(): void {
    if (this.selectionnerTous) {
      this.produitsSelectionnes = this.produitsPagines.map(p => p._id!).filter(Boolean);
    } else {
      this.produitsSelectionnes = [];
    }
  }

  toggleSelectionProduit(id: string): void {
    const index = this.produitsSelectionnes.indexOf(id);
    if (index > -1) {
      this.produitsSelectionnes.splice(index, 1);
    } else {
      this.produitsSelectionnes.push(id);
    }
    this.selectionnerTous = this.produitsSelectionnes.length === this.produitsPagines.length;
  }

  estSelectionne(id: string): boolean {
    return this.produitsSelectionnes.includes(id);
  }

  getLabelStatut(statut: string): string {
    const labels: { [key: string]: string } = {
      'en_stock': 'En Stock',
      'stock_faible': 'Stock Faible',
      'rupture': 'Rupture'
    };
    return labels[statut] || statut;
  }

  getClasseStatut(statut: string): string {
    return `statut-${statut}`;
  }

  supprimerProduit(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      // TODO: Implémenter la suppression via API
      this.produits = this.produits.filter(p => p._id !== id);
      this.calculerStatistiques();
      this.extraireCategories();
      this.appliquerFiltres();
    }
  }

  exporterProduits(): void {
    console.log('Export des produits:', this.produitsSelectionnes);
  }

  onItemsParPageChange(): void {
    this.pageActuelle = 1;
    this.calculerPagination();
    this.produitsSelectionnes = [];
    this.selectionnerTous = false;
  }

  getPaginationInfo(): string {
    const debut = this.produitsFiltres.length === 0 ? 0 : (this.pageActuelle - 1) * this.itemsParPage + 1;
    const fin = Math.min(this.pageActuelle * this.itemsParPage, this.produitsFiltres.length);
    return `${debut}-${fin} sur ${this.produitsFiltres.length} produits`;
  }

  getPagesVisibles(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let startPage = Math.max(2, this.pageActuelle - 1);
      let endPage = Math.min(this.totalPages - 1, this.pageActuelle + 1);

      if (this.pageActuelle <= 3) {
        endPage = Math.min(this.totalPages - 1, 4);
      }

      if (this.pageActuelle >= this.totalPages - 2) {
        startPage = Math.max(2, this.totalPages - 3);
      }

      if (startPage > 2) {
        pages.push(-1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < this.totalPages - 1) {
        pages.push(-1);
      }

      pages.push(this.totalPages);
    }

    return pages;
  }

  openAddModal(): void {
    const options = {};
    const modal = this.modalService.open(ProduitsAddFormComponent, options);

    // Recharger après fermeture si produit ajouté
    modal.result.then(
      (result) => {
        if (result === 'saved') {
          this.chargerProduits();
        }
      },
      () => {} // Dismiss
    );
  }

  retryLoad(): void {
    this.chargerProduits();
  }
}
