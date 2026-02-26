import { Component, EventEmitter, Output, Input, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';

interface Attribut {
  id: number;
  nom: string;
  type: string;
  obligatoire: boolean;
  isEditing: boolean;
}

@Component({
  selector: 'app-categorie-form',
  templateUrl: './categorie-form.component.html',
  styleUrls: ['./categorie-form.component.css'],
  standalone:false
})
export class CategorieFormComponent implements OnInit {

  categorie = {
    nom: '',
    description: ''
  };

  attributs: Attribut[] = [];
  private nextAttributId = 1;

  constructor(private elementRef: ElementRef,
              private modalService: NgbModal,
              private activeModal: NgbActiveModal,
              ) {}

  ngOnInit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.categorie = {
      nom: '',
      description: ''
    };
    this.attributs = [];
    this.nextAttributId = 1;
  }

  // Ajouter un attribut (ligne dans le tableau)
  ajouterAttribut(): void {
    // Vérifier si la dernière ligne est vide
    if (this.attributs.length > 0) {
      const dernier = this.attributs[this.attributs.length - 1];
      if (dernier.isEditing && (!dernier.nom.trim() || !dernier.type)) {
        return; // Empêcher d'ajouter si la dernière est vide
      }
    }

    const nouvelAttribut: Attribut = {
      id: this.nextAttributId++,
      nom: '',
      type: 'text',
      obligatoire: false,
      isEditing: true
    };

    this.attributs.push(nouvelAttribut);
  }

  // Confirmer l'attribut (quand on clique en dehors)
  confirmerAttribut(attribut: Attribut): void {
    if (attribut.nom.trim() && attribut.type) {
      attribut.isEditing = false;
    }
  }

  // Supprimer un attribut
  supprimerAttribut(id: number): void {
    this.attributs = this.attributs.filter(a => a.id !== id);
  }

  // Éditer un attribut existant
  editerAttribut(attribut: Attribut): void {
    attribut.isEditing = true;
  }

  // Fermer le form
  onClose(): void {
    this.resetForm();
    this.activeModal.close('Cross click');

  }
  saveCategorie(): void {}
  // Sauvegarder
  onSave(): void {
    if (this.isFormValid()) {
      const data = {
        ...this.categorie,
        attributs: this.attributs
          .filter(a => a.nom.trim() && a.type)
          .map(a => ({
            nom: a.nom,
            type: a.type,
            obligatoire: a.obligatoire
          }))
      };

      this.saveCategorie();
      this.resetForm();

    }
  }

  // Validation
  isFormValid(): boolean {
    return !!(this.categorie.nom.trim());
  }

  // Types d'attributs disponibles
  typesAttribut = [
    { value: 'text', label: 'Texte' },
    { value: 'number', label: 'Nombre' },
    { value: 'date', label: 'Date' },
    { value: 'boolean', label: 'Oui/Non' },
    { value: 'select', label: 'Liste déroulante' }
  ];

  // Fermer si clic sur l'overlay
  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }



}
