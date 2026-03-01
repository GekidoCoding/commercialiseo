import { Component, OnInit, HostListener } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { CategorieFormComponent } from '../../categorie/categorie-form/categorie-form.component';
import { finalize } from 'rxjs/operators';
import { Category } from '../../../../../shared/model/category';
import { AdminService } from '../../../services/admin.service';
import { PublicService } from '../../../../../shared/services/public.service';
import { Product } from '../../../../../shared/model/product';
import {ToastService} from '../../../../../shared/services/toast.service';

interface Specification {
  id: number;
  name: string;
  value: string;
  isEditing: boolean;
}

@Component({
  selector: 'app-produits-add-form',
  templateUrl: './produits-add-form.component.html',
  styleUrls: ['./produits-add-form.component.css'],
  standalone: false
})
export class ProduitsAddFormComponent implements OnInit {

  isDropdownOpen = false;

  produit = {
    nom: '',
    categorieId: null as string | null,
    code: '',
    dateSortie: ''
  };

  categories: Category[] = [];
  specifications: Specification[] = [];
  private nextSpecId = 1;
  isSubmitting = false;
  isLoadingCategories = false;
  errorMessage: string | null = null;

  // 🔧 Flag pour suivre si le modal catégorie est ouvert
  private isCategoryModalOpen = false;

  constructor(
    private modalService: NgbModal,
    private adminService: AdminService,
    private publicService: PublicService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.resetForm();
    this.loadCategories();
  }

  /**
   * Charge les catégories depuis le service
   */
  loadCategories(): void {
    this.isLoadingCategories = true;
    this.publicService.findAllCategories()
      .pipe(finalize(() => this.isLoadingCategories = false))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {

            this.categories = response.data;
            console.log(this.categories);
          } else {
            this.errorMessage = 'Erreur lors du chargement des catégories';
          }
        },
        error: (error) => {
          console.error('Erreur chargement catégories:', error);
          this.errorMessage = 'Impossible de charger les catégories';
        }
      });
  }

  /**
   * Ouvrir modal catégorie imbriqué - CORRIGÉ
   */
  openCategorieModal(): void {
    // Éviter les ouvertures multiples
    if (this.isCategoryModalOpen) {
      return;
    }

    this.isCategoryModalOpen = true;

    // Fermer le dropdown des catégories si ouvert
    this.isDropdownOpen = false;

    const modalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      size: 'lg',
      // Optionnel: ajouter une classe pour styling supplémentaire
      windowClass: 'category-modal-nested'
    };

    const modalRef = this.modalService.open(CategorieFormComponent, modalOptions);

    // Gérer la fermeture (success)
    modalRef.closed.subscribe((result) => {
      this.isCategoryModalOpen = false;
      console.log('Modal catégorie fermé avec succès:', result);
      this.loadCategories(); // Recharger les catégories
    });

    // Gérer le dismiss (fermeture via X ou backdrop)
    modalRef.dismissed.subscribe((reason) => {
      this.isCategoryModalOpen = false;
      console.log('Modal catégorie dismissé:', reason);
    });
  }

  /**
   * Supprime une catégorie après confirmation
   */
  deleteCategory(event: Event, category: Category): void {
    event.stopPropagation();

    if (!category._id) {
      return;
    }

    const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`);

    if (confirmed) {
      this.publicService.deleteCategory(category._id).subscribe({
        next: (response) => {
          if (response.success) {
            if (this.produit.categorieId === category._id) {
              this.produit.categorieId = null;
            }
            this.loadCategories();
          } else {
            this.errorMessage = response.message || 'Erreur lors de la suppression';
          }
        },
        error: (error) => {
          console.error('Erreur suppression catégorie:', error);
          this.errorMessage = error.message || 'Impossible de supprimer la catégorie';
        }
      });
    }
  }

  resetForm(): void {
    this.produit = {
      nom: '',
      categorieId: null,
      code: '',
      dateSortie: ''
    };
    this.specifications = [];
    this.nextSpecId = 1;
    this.isSubmitting = false;
    this.errorMessage = null;
  }

  /**
   * Ouvre/ferme le dropdown des catégories
   */
  toggleDropdown(): void {
    if (!this.isLoadingCategories) {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }

  /**
   * Sélectionne une catégorie
   */
  selectCategory(categoryId: string): void {
    this.produit.categorieId = categoryId;
    this.isDropdownOpen = false;
  }

  /**
   * Retourne le nom de la catégorie sélectionnée
   */
  getSelectedCategoryName(): string {
    if (this.categories && this.categories.length > 0) {
      const selected = this.categories.find(c => c._id === this.produit.categorieId);
      return selected ? selected.name : '';
    }
    return '';

  }

  /**
   * Ferme le dropdown quand on clique en dehors
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-container')) {
      this.isDropdownOpen = false;
    }
  }

  // Gestion des spécifications
  addSpecification(): void {
    if (this.specifications.length > 0) {
      const last = this.specifications[this.specifications.length - 1];
      if (last.isEditing && (!last.name.trim() || !last.value.trim())) {
        return;
      }
    }

    this.specifications.push({
      id: this.nextSpecId++,
      name: '',
      value: '',
      isEditing: true
    });
  }

  confirmSpecification(spec: Specification): void {
    if (spec.name.trim() && spec.value.trim()) {
      spec.isEditing = false;
    }
  }

  removeSpecification(id: number): void {
    this.specifications = this.specifications.filter(s => s.id !== id);
  }

  /**
   * Convertit les spécifications en format objet clé-valeur
   */
  private buildSpecsObject(): { [key: string]: any } {
    const specs: { [key: string]: any } = {};

    this.specifications
      .filter(s => s.name.trim() && s.value.trim())
      .forEach(s => {
        const trimmedValue = s.value.trim();
        if (trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) {
          try {
            specs[s.name.trim()] = JSON.parse(trimmedValue);
          } catch {
            specs[s.name.trim()] = trimmedValue;
          }
        } else {
          specs[s.name.trim()] = trimmedValue;
        }
      });

    return specs;
  }

  // Validation
  isFormValid(): boolean {
    return !!(this.produit.nom.trim() &&
      this.produit.categorieId &&
      this.produit.code.trim() &&
      this.produit.dateSortie);
  }

  // Actions
  onClose(): void {
    this.resetForm();
    this.modalService.dismissAll();
  }

  onSave(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const productData: Product = {
      _id: '',
      image:'',
      name: this.produit.nom.trim(),
      categoryId: this.produit.categorieId!,
      code: this.produit.code.trim(),
      specs: this.buildSpecsObject(),
      releaseDate: this.produit.dateSortie
    };

    this.adminService.createProduct(productData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Produit créé avec succès:', response.data);
            this.toastService.success('Produit créé avec succès');
          } else {
            this.errorMessage = response.message || 'Erreur lors de la création du produit';
          }
        },
        error: (error) => {
          console.error('Erreur création produit:', error);
          this.errorMessage = error.message || 'Une erreur est survenue lors de la création';
        }
      });
  }

  onOverlayClick(event: MouseEvent): void {
    // Ne pas fermer si le modal catégorie est ouvert
    if (this.isCategoryModalOpen) {
      return;
    }
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
