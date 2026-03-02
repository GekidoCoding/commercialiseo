import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PublicService } from '../../../../shared/services/public.service';
import { Product } from '../../../../shared/model/product';
import { Variant } from '../../../../shared/model/Variant';
import { finalize } from 'rxjs/operators';
import {AuthUtilService} from '../../../../shared/services/auth-util.service';
import {BoutiqueService} from '../../services/boutique.service';

interface Specification {
  id: number;
  name: string;
  value: string;
  isEditing: boolean;
}

@Component({
  selector: 'app-variant-add-form',
  templateUrl: './variant-add-form.component.html',
  styleUrls: ['./variant-add-form.component.css'],
  standalone: false
})
export class VariantAddFormComponent implements OnInit {

  // Autocomplétion produits
  produits: Product[] = [];
  produitsFiltres: Product[] = [];
  rechercheProduit: string = '';
  showAutocomplete: boolean = false;
  produitSelectionne: Product | null = null;

  // Formulaire variant
  variant = {
    code: '',
    price: null as number | null,
    stock: null as number | null,
    isMain: false
  };

  // Spécifications
  specifications: Specification[] = [];
  private nextSpecId = 1;

  // Upload fichiers
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  // États
  isSubmitting: boolean = false;
  isLoadingProducts: boolean = false;
  errorMessage: string | null = null;

  constructor(
    public activeModal: NgbActiveModal,
    private boutiqueService: BoutiqueService,
    private publicService: PublicService,
    private authService: AuthUtilService
  ) {}

  ngOnInit(): void {
    this.chargerProduits();
  }

  chargerProduits(): void {
    this.isLoadingProducts = true;
    this.publicService.findAllProductsReal()
      .pipe(finalize(() => this.isLoadingProducts = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.produits = response.data || [];
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors du chargement des produits';
        }
      });
  }

  // ==================== AUTOCOMPLÉTION ====================

  onRechercheProduit(): void {
    if (!this.rechercheProduit.trim()) {
      this.produitsFiltres = [];
      this.showAutocomplete = false;
      return;
    }

    const terme = this.rechercheProduit.toLowerCase();
    this.produitsFiltres = this.produits.filter(p =>
      p.name?.toLowerCase().includes(terme) ||
      p.code?.toLowerCase().includes(terme)
    ).slice(0, 10);

    this.showAutocomplete = this.produitsFiltres.length > 0;
  }

  selectionnerProduit(produit: Product): void {
    this.produitSelectionne = produit;
    this.rechercheProduit = produit.name;
    this.showAutocomplete = false;
  }

  // ==================== SPÉCIFICATIONS ====================

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

  // ==================== UPLOAD FICHIERS ====================

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        if (file.type.startsWith('image/')) {
          this.selectedFiles.push(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            this.imagePreviews.push(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  // ==================== VALIDATION & SAUVEGARDE ====================

  isFormValid(): boolean {
    return !!(
      this.produitSelectionne &&
      this.variant.code.trim() &&
      this.variant.price !== null &&
      this.variant.stock !== null
    );
  }

  buildSpecsObject(): { [key: string]: any } {
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

  onSave(): void {
    if (!this.isFormValid()) return;

    this.isSubmitting = true;
    this.errorMessage = null;

    const formData = new FormData();

    // Données du variant
    const variantData: Partial<Variant> = {
      productId: this.produitSelectionne!._id,
      code: this.variant.code.trim(),
      price: this.variant.price!,
      stock: this.variant.stock!,
      userId: this.authService.getUserFromStorage()?.id || '',
      specificAttributes: this.buildSpecsObject(),
      isMain: this.variant.isMain,
      lastUpdated: new Date()
    };

    formData.append('variant', JSON.stringify(variantData));

    // Fichiers
    this.selectedFiles.forEach((file, index) => {
      formData.append(`images`, file, file.name);
    });

    this.boutiqueService.createVariantWithFiles(formData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.activeModal.close('saved');
          } else {
            this.errorMessage = response.message || 'Erreur lors de la création';
          }
        },
        error: (error) => {
          this.errorMessage = error.message || 'Une erreur est survenue';
        }
      });
  }

  onClose(): void {
    this.activeModal.dismiss();
  }
}
