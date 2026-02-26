import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {CategorieFormComponent} from '../../categorie/categorie-form/categorie-form.component';

interface Specification {
  id: number;
  name: string;
  value: string;
  isEditing: boolean;
}

@Component({
  selector: 'app-produits-form',
  templateUrl: './produits-form.component.html',
  styleUrls: ['./produits-form.component.css'],
  standalone: false
})
export class ProduitsFormComponent implements OnInit {

  produit = {
    nom: '',
    categorieId: null as number | null,
    code: '',
    dateSortie: ''
  };

  categories: any[] = [
    { id: 1, name: 'Électronique' },
    { id: 2, name: 'Informatique' },
    { id: 3, name: 'Téléphonie' },
    { id: 4, name: 'Accessoires' }
  ];

  specifications: Specification[] = [];
  private nextSpecId = 1;
  isSubmitting = false;

  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {
    this.resetForm();
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
  }

  // Ouvrir modal catégorie imbriqué
  openCategorieModal(): void {
    this.modalService.open(CategorieFormComponent, {
      backdrop: 'static',
      keyboard: false,
      size: 'lg'
    });
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
    if (this.isFormValid()) {
      this.isSubmitting = true;

      const data = {
        ...this.produit,
        specifications: this.specifications.filter(s => s.name.trim() && s.value.trim())
      };

      console.log('Produit sauvegardé:', data);

      setTimeout(() => {
        this.isSubmitting = false;
        this.onClose();
      }, 500);
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
