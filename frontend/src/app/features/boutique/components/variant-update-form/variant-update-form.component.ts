import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Variant } from '../../../../shared/model/Variant';
import { ProductRead } from '../../../../shared/model/product-read';
import { VariantRead } from '../../../../shared/model/variant-read';
import { finalize } from 'rxjs/operators';
import {BoutiqueService} from '../../services/boutique.service';
import {ToastService} from '../../../../shared/services/toast.service';
import {environment} from '../../../../../environments/environment';

interface Specification {
  id: number;
  name: string;
  value: string;
  isEditing: boolean;
}

@Component({
  selector: 'app-variant-update-form',
  templateUrl: './variant-update-form.component.html',
  styleUrls: ['./variant-update-form.component.css'],
  standalone: false
})
export class VariantUpdateFormComponent implements OnInit {

  @Input() variant!: VariantRead;
  @Input() product!: ProductRead;

  public serveurUrl=environment.apiUrl;

  // Formulaire
  variantForm = {
    code: '',
    price: 0,
    stock: 0,
    isMain: false
  };

  // Spécifications
  specifications: Specification[] = [];
  private nextSpecId = 1;

  // Images existantes et nouvelles
  existingImages: any[] = [];
  selectedFiles: File[] = [];
  newImagePreviews: string[] = [];
  imagesToDelete: string[] = [];

  // États
  isSubmitting: boolean = false;
  errorMessage: string | null = null;

  constructor(
    public activeModal: NgbActiveModal,
    private boutiqueService: BoutiqueService,
    private toastr:ToastService,
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.variantForm = {
      code: this.variant.code,
      price: this.variant.price,
      stock: this.variant.stock,
      isMain: this.variant.isMain
    };

    this.existingImages = this.variant.images || [];

    // Convertir specificAttributes en specifications
    if (this.variant.specificAttributes) {
      Object.entries(this.variant.specificAttributes).forEach(([key, value], index) => {
        this.specifications.push({
          id: index + 1,
          name: key,
          value: Array.isArray(value) ? JSON.stringify(value) : String(value),
          isEditing: false
        });
        this.nextSpecId = index + 2;
      });
    }
  }

  // ==================== SPÉCIFICATIONS ====================

  addSpecification(): void {
    this.specifications.push({
      id: this.nextSpecId++,
      name: '',
      value: '',
      isEditing: true
    });
  }

  removeSpecification(id: number): void {
    this.specifications = this.specifications.filter(s => s.id !== id);
  }

  // ==================== GESTION IMAGES ====================

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        if (file.type.startsWith('image/')) {
          this.selectedFiles.push(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            this.newImagePreviews.push(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  removeNewImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.newImagePreviews.splice(index, 1);
  }

  markImageForDeletion(imageUrl: string): void {
    this.imagesToDelete.push(imageUrl);
    this.existingImages = this.existingImages.filter(img => img !== imageUrl);
  }

  // ==================== VALIDATION & SAUVEGARDE ====================

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
    this.isSubmitting = true;
    this.errorMessage = null;

    const formData = new FormData();

    const variantData: Partial<Variant> = {
      _id: this.variant._id,
      productId: this.product._id,
      code: this.variantForm.code.trim(),
      price: this.variantForm.price,
      stock: this.variantForm.stock,
      userId: this.variant.userId,
      specificAttributes: this.buildSpecsObject(),
      isMain: this.variantForm.isMain,
      lastUpdated: new Date()
    };

    formData.append('variant', JSON.stringify(variantData));
    formData.append('imagesToDelete', JSON.stringify(this.imagesToDelete));

    this.selectedFiles.forEach((file) => {
      formData.append(`images`, file, file.name);
    });
    console.log("data before update variant:"+ JSON.stringify(formData, null, 2));
    this.boutiqueService.updateVariantWithFiles(formData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success('Variant mis à jour avec succès');
            this.activeModal.close('saved');
          } else {
            this.errorMessage = response.message || 'Erreur lors de la mise à jour';
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
