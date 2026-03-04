import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {NgbActiveModal, NgbToast} from '@ng-bootstrap/ng-bootstrap';
import {PublicService} from '../../../../../shared/services/public.service';
import {Category} from '../../../../../shared/model/category';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ToastService} from '../../../../../shared/services/toast.service';



@Component({
  selector: 'app-categorie-form',
  templateUrl: './categorie-form.component.html',
  styleUrls: ['./categorie-form.component.css'],
  standalone: false
})
export class CategorieFormComponent implements OnInit {

  categorie: Category = { _id: '', name: '', unity: '' };

  constructor(
    private activeModal: NgbActiveModal,
    private categorieService: PublicService ,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
    // Injection du service
  ) {}

  ngOnInit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.categorie = {
      _id: '', name: '', unity: '' };
    this.cdr.detectChanges();
  }

  // Fermer le modal
  onClose(): void {
    this.resetForm();
    this.activeModal.dismiss('Cross click');
  }

  // Sauvegarder la catégorie via le service
  saveCategorie(): void {
    this.categorieService.createCategory(this.categorie).subscribe({
      next: (response) => {
        console.log('Catégorie créée avec succès:', response);
        this.toastService.success('Catégorie créée avec succès');
        this.activeModal.close(response); // Ferme le modal et retourne la réponse
      },
      error: (error) => {
        console.error('Erreur lors de la création:', error);
        this.cdr.detectChanges();
      }
    });
  }

  // Validation du formulaire
  onSave(): void {
    if (this.isFormValid()) {
      this.saveCategorie();
    }
  }

  // Validation
  isFormValid(): boolean {
    return !!(this.categorie.name.trim());
  }

}
