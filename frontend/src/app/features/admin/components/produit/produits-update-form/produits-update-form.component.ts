import { Component, OnInit, HostListener, ChangeDetectorRef, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbModal, NgbModalOptions, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CategorieFormComponent } from '../../categorie/categorie-form/categorie-form.component';
import { finalize } from 'rxjs/operators';
import { Category } from '../../../../../shared/model/category';
import { AdminService } from '../../../services/admin.service';
import { PublicService } from '../../../../../shared/services/public.service';
import { Product } from '../../../../../shared/model/product';
import { ProductRead } from '../../../../../shared/model/product-read';
import { ToastService } from '../../../../../shared/services/toast.service';

interface Specification {
  id: number;
  name: string;
  value: string;
  isEditing: boolean;
}

@Component({
  selector: 'app-produits-update-form',
  templateUrl: './produits-update-form.component.html',
  styleUrls: ['./produits-update-form.component.css'],
  standalone: false
})
export class ProduitsUpdateFormComponent implements OnInit {

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

  // Produit à modifier
  produitOriginal: ProductRead | null = null;

  // 🔧 Flag pour suivre si le modal catégorie est ouvert
  private isCategoryModalOpen = false;

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private adminService: AdminService,
    private publicService: PublicService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Initialise le formulaire avec les données du produit à modifier
   */
  setProduitToEdit(produit: ProductRead): void {
    this.produitOriginal = produit;
    
    // Remplir le formulaire avec les données existantes
    this.produit.nom = produit.product.name || '';
    this.produit.categorieId = produit.category._id || null;
    this.produit.code = produit.product.code || '';
    this.produit.dateSortie = produit.product.releaseDate ? 
      new Date(produit.product.releaseDate).toISOString().split('T')[0] : '';

    // Charger les spécifications existantes
    if (produit.product.specs && typeof produit.product.specs === 'object') {
      Object.entries(produit.product.specs).forEach(([key, value], index) => {
        let stringValue = '';
        if (Array.isArray(value)) {
          stringValue = JSON.stringify(value);
        } else if (typeof value === 'object') {
          stringValue = JSON.stringify(value);
        } else {
          stringValue = String(value);
        }

        this.specifications.push({
          id: this.nextSpecId++,
          name: key,
          value: stringValue,
          isEditing: false
        });
      });
    }

    this.cdr.detectChanges();
  }

  /**
   * Charge les catégories depuis le service
   */
  loadCategories(): void {
    this.isLoadingCategories = true;
    this.cdr.detectChanges(); // Force detection pour loading
    
    this.publicService.findAllCategories()
      .pipe(finalize(() => {
        this.isLoadingCategories = false;
        this.cdr.detectChanges(); // Force detection après fin loading
      }))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.categories = response.data;
            console.log(this.categories);
            this.cdr.detectChanges(); // Force detection après chargement
          } else {
            this.errorMessage = 'Erreur lors du chargement des catégories';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Erreur chargement catégories:', error);
          this.errorMessage = 'Impossible de charger les catégories';
          this.cdr.detectChanges(); // Force detection après erreur
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
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Erreur suppression catégorie:', error);
          this.errorMessage = error.message || 'Impossible de supprimer la catégorie';
          this.cdr.detectChanges();
        }
      });
    }
  }

  resetForm(): void {
    if (this.produitOriginal) {
      // Restaurer les valeurs originales
      this.produit.nom = this.produitOriginal.product.name || '';
      this.produit.categorieId = this.produitOriginal.category._id || null;
      this.produit.code = this.produitOriginal.product.code || '';
      this.produit.dateSortie = this.produitOriginal.product.releaseDate ? 
        new Date(this.produitOriginal.product.releaseDate).toISOString().split('T')[0] : '';

      // Restaurer les spécifications
      this.specifications = [];
      this.nextSpecId = 1;
      
      if (this.produitOriginal.product.specs && typeof this.produitOriginal.product.specs === 'object') {
        Object.entries(this.produitOriginal.product.specs).forEach(([key, value]) => {
          let stringValue = '';
          if (Array.isArray(value)) {
            stringValue = JSON.stringify(value);
          } else if (typeof value === 'object') {
            stringValue = JSON.stringify(value);
          } else {
            stringValue = String(value);
          }

          this.specifications.push({
            id: this.nextSpecId++,
            name: key,
            value: stringValue,
            isEditing: false
          });
        });
      }
    }
    
    this.isSubmitting = false;
    this.errorMessage = null;
    this.cdr.detectChanges();
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
    this.cdr.detectChanges();
  }

  confirmSpecification(spec: Specification): void {
    if (spec.name.trim() && spec.value.trim()) {
      spec.isEditing = false;
      this.cdr.detectChanges();
    }
  }

  removeSpecification(id: number): void {
    this.specifications = this.specifications.filter(s => s.id !== id);
    this.cdr.detectChanges();
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
    this.activeModal.dismiss('closed');
  }

  onSave(): void {
    if (!this.isFormValid()) {
      return;
    }

    if (!this.produitOriginal || !this.produitOriginal._id) {
      this.errorMessage = 'Aucun produit à modifier';
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.cdr.detectChanges(); // Force detection pour afficher loading

    const productData: Product = {
      _id: this.produitOriginal._id,
      image: this.produitOriginal.product.image || '',
      name: this.produit.nom.trim(),
      categoryId: this.produit.categorieId!,
      code: this.produit.code.trim(),
      specs: this.buildSpecsObject(),
      releaseDate: this.produit.dateSortie
    };

    this.adminService.updateProduct(productData)
      .pipe(finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges(); // Force detection après fin soumission
      }))
      .subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Produit mis à jour avec succès:', response.data);
            this.toastService.success('Produit mis à jour avec succès');
            this.activeModal.close('updated');
          } else {
            this.errorMessage = response.message || 'Erreur lors de la mise à jour du produit';
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Erreur mise à jour produit:', error);
          this.errorMessage = error.message || 'Une erreur est survenue lors de la mise à jour';
          this.cdr.detectChanges(); // Force detection après erreur
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
