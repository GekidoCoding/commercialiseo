import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProduitsAddFormComponent } from '../../components/produit/produits-add-form/produits-add-form.component';
import { AdminService } from '../../services/admin.service';
import { finalize } from 'rxjs/operators';
import {ProductRead} from '../../../../shared/model/product-read';

interface StatCard {
  titre: string;
  valeur: string | number;
  icone: string;
  couleur: string;
  evolution?: string;
  evolutionPositive?: boolean;
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

  // Données des statistiques
  statsCards: StatCard[] = [
    {
      titre: 'Total Produits',
      valeur: 1258,
      icone: 'fa-box',
      couleur: 'primary',
      evolution: '+12%',
      evolutionPositive: true
    },
    {
      titre: 'En Stock',
      valeur: 1025,
      icone: 'fa-check-circle',
      couleur: 'success',
      evolution: '+5%',
      evolutionPositive: true
    },

    {
      titre: 'Stock Faible',
      valeur: 198,
      icone: 'fa-exclamation-triangle',
      couleur: 'warning',
      evolution: '-3%',
      evolutionPositive: false
    },
    {
      titre: 'Rupture de Stock',
      valeur: 35,
      icone: 'fa-times-circle',
      couleur: 'danger',
      evolution: '+8%',
      evolutionPositive: false
    }
  ];

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
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log(response);
          if (response.success && response.data) {
            this.produits = response.data;
            this.extraireCategories();
            this.appliquerFiltres();
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
    // const total = this.produits.length;
    // const enStock = this.produits.filter(p => p.quantity > 10).length;
    // const stockFaible = this.produits.filter(p => p.quantity > 0 && p.quantity <= 10).length;
    // const rupture = this.produits.filter(p => p.quantity === 0).length;
    // const total = 0;
    // const enStock = 0;
    // const stockFaible = 0;
    // const rupture = 0;
    //
    // this.statsCards[0].valeur = total;
    // this.statsCards[1].valeur = enStock;
    // this.statsCards[2].valeur = stockFaible;
    // this.statsCards[3].valeur = rupture;
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
