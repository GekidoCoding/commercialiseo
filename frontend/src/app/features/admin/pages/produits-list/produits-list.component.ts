import { Component, OnInit } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ProduitsAddFormComponent} from '../../components/produit/produits-add-form/produits-add-form.component';

interface Produit {
  id: number;
  code: string;
  nom: string;
  categorie: string;
  prix: number;
  quantite: number;
  statut: 'en_stock' | 'stock_faible' | 'rupture';
  dateCreation: string;
  image?: string;
}

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
  // Données des statistiques
  statsCards: StatCard[] = [
    {
      titre: 'Total Produits',
      valeur: 1248,
      icone: 'fa-box',
      couleur: 'primary',
      evolution: '+12%',
      evolutionPositive: true
    },
    {
      titre: 'En Stock',
      valeur: 892,
      icone: 'fa-check-circle',
      couleur: 'success',
      evolution: '+5%',
      evolutionPositive: true
    },
    {
      titre: 'Stock Faible',
      valeur: 156,
      icone: 'fa-exclamation-triangle',
      couleur: 'warning',
      evolution: '-3%',
      evolutionPositive: false
    },
    {
      titre: 'Rupture de Stock',
      valeur: 42,
      icone: 'fa-times-circle',
      couleur: 'danger',
      evolution: '+8%',
      evolutionPositive: false
    }
  ];

  // Liste des produits
  produits: Produit[] = [];
  produitsFiltres: Produit[] = [];

  // Filtres
  recherche: string = '';
  filtreStatut: string = 'tous';
  filtreCategorie: string = 'toutes';

  // Pagination
  pageActuelle: number = 1;
  itemsParPage: number = 10;
  totalPages: number = 1;

  // Sélection
  produitsSelectionnes: number[] = [];
  selectionnerTous: boolean = false;

  // Categories uniques pour le filtre
  categories: string[] = [];

  constructor(
    public modalService:NgbModal,
  ) {}

  ngOnInit(): void {
    this.chargerProduits();
  }

  chargerProduits(): void {
    // Données mockées - remplacer par appel API
    this.produits = [
      {
        id: 1,
        code: 'PRD-001',
        nom: 'iPhone 15 Pro Max',
        categorie: 'Téléphonie',
        prix: 1250,
        quantite: 45,
        statut: 'en_stock',
        dateCreation: '2024-01-15'
      },
      {
        id: 2,
        code: 'PRD-002',
        nom: 'MacBook Air M3',
        categorie: 'Informatique',
        prix: 1499,
        quantite: 12,
        statut: 'stock_faible',
        dateCreation: '2024-01-14'
      },
      {
        id: 3,
        code: 'PRD-003',
        nom: 'AirPods Pro 2',
        categorie: 'Accessoires',
        prix: 249,
        quantite: 0,
        statut: 'rupture',
        dateCreation: '2024-01-13'
      },
      {
        id: 4,
        code: 'PRD-004',
        nom: 'iPad Air 5',
        categorie: 'Tablette',
        prix: 699,
        quantite: 78,
        statut: 'en_stock',
        dateCreation: '2024-01-12'
      },
      {
        id: 5,
        code: 'PRD-005',
        nom: 'Apple Watch Series 9',
        categorie: 'Accessoires',
        prix: 429,
        quantite: 5,
        statut: 'stock_faible',
        dateCreation: '2024-01-11'
      },
      {
        id: 6,
        code: 'PRD-006',
        nom: 'Samsung Galaxy S24',
        categorie: 'Téléphonie',
        prix: 999,
        quantite: 34,
        statut: 'en_stock',
        dateCreation: '2024-01-10'
      },
      {
        id: 7,
        code: 'PRD-007',
        nom: 'Dell XPS 13',
        categorie: 'Informatique',
        prix: 1199,
        quantite: 0,
        statut: 'rupture',
        dateCreation: '2024-01-09'
      },
      {
        id: 8,
        code: 'PRD-008',
        nom: 'Sony WH-1000XM5',
        categorie: 'Audio',
        prix: 399,
        quantite: 23,
        statut: 'en_stock',
        dateCreation: '2024-01-08'
      }
    ];

    this.extraireCategories();
    this.appliquerFiltres();
  }

  extraireCategories(): void {
    this.categories = [...new Set(this.produits.map(p => p.categorie))];
  }

  appliquerFiltres(): void {
    let resultats = [...this.produits];

    // Filtre recherche
    if (this.recherche.trim()) {
      const terme = this.recherche.toLowerCase();
      resultats = resultats.filter(p =>
        p.nom.toLowerCase().includes(terme) ||
        p.code.toLowerCase().includes(terme) ||
        p.categorie.toLowerCase().includes(terme)
      );
    }

    // Filtre statut
    if (this.filtreStatut !== 'tous') {
      resultats = resultats.filter(p => p.statut === this.filtreStatut);
    }

    // Filtre categorie
    if (this.filtreCategorie !== 'toutes') {
      resultats = resultats.filter(p => p.categorie === this.filtreCategorie);
    }

    this.produitsFiltres = resultats;
    this.calculerPagination();
    this.pageActuelle = 1;
  }

  calculerPagination(): void {
    this.totalPages = Math.ceil(this.produitsFiltres.length / this.itemsParPage);
  }

  get produitsPagines(): Produit[] {
    const debut = (this.pageActuelle - 1) * this.itemsParPage;
    return this.produitsFiltres.slice(debut, debut + this.itemsParPage);
  }

  changerPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageActuelle = page;
    }
  }

  toggleSelectionTous(): void {
    if (this.selectionnerTous) {
      this.produitsSelectionnes = this.produitsPagines.map(p => p.id);
    } else {
      this.produitsSelectionnes = [];
    }
  }

  toggleSelectionProduit(id: number): void {
    const index = this.produitsSelectionnes.indexOf(id);
    if (index > -1) {
      this.produitsSelectionnes.splice(index, 1);
    } else {
      this.produitsSelectionnes.push(id);
    }
    this.selectionnerTous = this.produitsSelectionnes.length === this.produitsPagines.length;
  }

  estSelectionne(id: number): boolean {
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

  supprimerProduit(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.produits = this.produits.filter(p => p.id !== id);
      this.appliquerFiltres();
    }
  }

  exporterProduits(): void {
    console.log('Export des produits:', this.produitsSelectionnes);
  }
  onItemsParPageChange(): void {
    this.pageActuelle = 1;
    this.calculerPagination();
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
      // Toujours afficher la première page
      pages.push(1);

      let startPage = Math.max(2, this.pageActuelle - 1);
      let endPage = Math.min(this.totalPages - 1, this.pageActuelle + 1);

      // Ajuster si on est au début
      if (this.pageActuelle <= 3) {
        endPage = Math.min(this.totalPages - 1, 4);
      }

      // Ajuster si on est à la fin
      if (this.pageActuelle >= this.totalPages - 2) {
        startPage = Math.max(2, this.totalPages - 3);
      }

      // Ajouter ellipsis après la première page si nécessaire
      if (startPage > 2) {
        pages.push(-1); // -1 représente ...
      }

      // Ajouter les pages du milieu
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Ajouter ellipsis avant la dernière page si nécessaire
      if (endPage < this.totalPages - 1) {
        pages.push(-1);
      }

      // Toujours afficher la dernière page
      pages.push(this.totalPages);
    }

    return pages;
  }
  openAddModal(): void {
    const options = {};
    const modal = this.modalService.open(ProduitsAddFormComponent, options);
  }


}
