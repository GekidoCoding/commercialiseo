import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { BoutiqueService } from '../../services/boutique.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { VariantRead } from '../../../../shared/model/variant-read';
import { PromotionRead } from '../../../../shared/model/promotion-read';
import { Promotion } from '../../../../shared/model/promotion';
import { PromotionType } from '../../../../shared/constants/promotion-type';

@Component({
  selector: 'app-promotion-update-form',
  templateUrl: './promotion-update-form.component.html',
  styleUrls: ['./promotion-update-form.component.css'],
  standalone: false
})
export class PromotionUpdateFormComponent implements OnInit {

  @Input() promotion!: PromotionRead;
  @Input() variant!: VariantRead;

  // Constantes des types de promotion
  readonly PromotionType = PromotionType;

  // Champs read-only affichés
  variantCode: string = '';

  // Mode de saisie des dates : 'duration' ou 'dates'
  dateInputMode: 'duration' | 'dates' = 'dates';

  // Unité de durée : 'hours', 'days', 'months'
  durationUnit: 'hours' | 'days' | 'months' = 'days';

  // Formulaire promotion
  promotionForm = {
    typePromotion: PromotionType.REMISE as typeof PromotionType[keyof typeof PromotionType],
    value: null as number | null,
    duration: null as number | null,
    dateBegin: '',
    dateEnd: ''
  };

  // États
  isSubmitting: boolean = false;
  errorMessage: string | null = null;

  // Aperçu du prix avec promo
  prixAvecPromo: number | null = null;

  constructor(
    public activeModal: NgbActiveModal,
    private boutiqueService: BoutiqueService,
    private toastr: ToastService
  ) {}

  ngOnInit(): void {
    this.variantCode = this.variant.code || '';
    this.initForm();
  }

  initForm(): void {
    // Initialiser le formulaire avec les valeurs de la promotion existante
    this.promotionForm.typePromotion = this.promotion.typePromotion as typeof PromotionType[keyof typeof PromotionType];
    this.promotionForm.value = this.promotion.value;

    // Formater les dates pour l'input datetime-local (format: YYYY-MM-DDTHH:mm)
    const dateBegin = new Date(this.promotion.dateBegin);
    const dateEnd = new Date(this.promotion.dateEnd);

    this.promotionForm.dateBegin = this.formatDateForInput(dateBegin);
    this.promotionForm.dateEnd = this.formatDateForInput(dateEnd);

    // Calculer la durée initiale en jours
    const diffTime = dateEnd.getTime() - dateBegin.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.promotionForm.duration = diffDays > 0 ? diffDays : null;

    this.calculerApercu();
  }

  /**
   * Formate une date pour l'input datetime-local
   */
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // ==================== APERÇU PRIX ====================

  calculerApercu(): void {
    if (this.promotionForm.value === null || this.promotionForm.value <= 0) {
      this.prixAvecPromo = null;
      return;
    }

    if (this.promotionForm.typePromotion === PromotionType.REMISE) {
      // REMISE : pourcentage
      this.prixAvecPromo = this.variant.price * (1 - this.promotionForm.value / 100);
    } else {
      // PRICE et DISCOUNT : montant fixe à déduire
      this.prixAvecPromo = Math.max(0, this.variant.price - this.promotionForm.value);
    }
  }

  // ==================== GESTION DURATION ====================

  onDateModeChange(mode: 'duration' | 'dates'): void {
    this.dateInputMode = mode;
    // Ne pas vider les valeurs, elles restent synchronisées
  }

  /**
   * Appelé quand la durée change - met à jour les dates
   */
  onDurationChange(): void {
    if (this.promotionForm.duration && this.promotionForm.duration > 0) {
      const durationInHours = this.convertDurationToHours(this.promotionForm.duration, this.durationUnit);

      const dateBegin = new Date();
      const dateEnd = new Date();
      dateEnd.setHours(dateEnd.getHours() + durationInHours);

      this.promotionForm.dateBegin = this.formatDateForInput(dateBegin);
      this.promotionForm.dateEnd = this.formatDateForInput(dateEnd);
    }
  }

  /**
   * Appelé quand l'unité de durée change - recalcule les dates
   */
  onDurationUnitChange(): void {
    this.onDurationChange();
  }

  /**
   * Appelé quand les dates changent - met à jour la durée
   */
  onDatesChange(): void {
    if (this.promotionForm.dateBegin && this.promotionForm.dateEnd) {
      const dateBegin = new Date(this.promotionForm.dateBegin);
      const dateEnd = new Date(this.promotionForm.dateEnd);

      if (!isNaN(dateBegin.getTime()) && !isNaN(dateEnd.getTime()) && dateEnd > dateBegin) {
        const diffTime = dateEnd.getTime() - dateBegin.getTime();
        const diffHours = diffTime / (1000 * 60 * 60);

        // Convertir en fonction de l'unité sélectionnée
        switch (this.durationUnit) {
          case 'hours':
            this.promotionForm.duration = Math.round(diffHours);
            break;
          case 'days':
            this.promotionForm.duration = Math.round(diffHours / 24);
            break;
          case 'months':
            this.promotionForm.duration = Math.round(diffHours / (24 * 30));
            break;
        }
      }
    }
  }

  /**
   * Convertit la durée en heures selon l'unité choisie
   */
  convertDurationToHours(duration: number, unit: 'hours' | 'days' | 'months'): number {
    switch (unit) {
      case 'hours':
        return duration;
      case 'days':
        return duration * 24;
      case 'months':
        return duration * 24 * 30; // 30 jours par mois
      default:
        return duration;
    }
  }

  /**
   * Retourne le label de l'unité de durée
   */
  getDurationUnitLabel(unit: 'hours' | 'days' | 'months'): string {
    const labels: { [key: string]: string } = {
      'hours': 'heures',
      'days': 'jours',
      'months': 'mois'
    };
    return labels[unit] || unit;
  }

  // ==================== VALIDATION ====================

  isFormValid(): boolean {
    return this.getFormErrors().length === 0;
  }

  /**
   * Retourne la liste des erreurs de validation du formulaire
   */
  getFormErrors(): string[] {
    const errors: string[] = [];

    // Validation de la valeur
    if (this.promotionForm.value === null || this.promotionForm.value <= 0) {
      errors.push('La valeur de la promotion est requise et doit être supérieure à 0');
    }

    // Validation selon le type de promotion
    if (this.promotionForm.typePromotion === PromotionType.REMISE && this.promotionForm.value! > 100) {
      errors.push('La remise en pourcentage ne peut pas dépasser 100%');
    }

    // Validation des dates selon le mode
    if (this.dateInputMode === 'duration') {
      // Mode duration
      if (!this.promotionForm.duration || this.promotionForm.duration <= 0) {
        errors.push('La durée est requise et doit être supérieure à 0');
      }
    } else {
      // Mode dates - validation croisée
      const hasDateBegin = !!this.promotionForm.dateBegin;
      const hasDateEnd = !!this.promotionForm.dateEnd;

      // Si une date est remplie, l'autre doit l'être aussi
      if (hasDateBegin && !hasDateEnd) {
        errors.push('La date de fin est requise car la date de début est renseignée');
      }
      if (!hasDateBegin && hasDateEnd) {
        errors.push('La date de début est requise car la date de fin est renseignée');
      }

      // Validation des valeurs si les deux dates sont présentes
      if (hasDateBegin && hasDateEnd) {
        const dateBegin = new Date(this.promotionForm.dateBegin);
        const dateEnd = new Date(this.promotionForm.dateEnd);

        if (isNaN(dateBegin.getTime())) {
          errors.push('La date de début est invalide');
        }
        if (isNaN(dateEnd.getTime())) {
          errors.push('La date de fin est invalide');
        }
        if (!isNaN(dateBegin.getTime()) && !isNaN(dateEnd.getTime()) && dateBegin >= dateEnd) {
          errors.push('La date de fin doit être postérieure à la date de début');
        }
      }
    }

    return errors;
  }

  /**
   * Retourne le premier message d'erreur ou null si valide
   */
  getFirstError(): string | null {
    const errors = this.getFormErrors();
    return errors.length > 0 ? errors[0] : null;
  }

  getDateMinFin(): string {
    return this.promotionForm.dateBegin || '';
  }

  // ==================== SAUVEGARDE ====================

  onSave(): void {
    const errors = this.getFormErrors();
    if (errors.length > 0) {
      this.errorMessage = errors[0];
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    // Calculer les dates si mode duration est sélectionné
    let dateBegin: Date;
    let dateEnd: Date;

    if (this.dateInputMode === 'duration' && this.promotionForm.duration) {
      // Mode duration : ajouter la durée à la date actuelle ou garder la dateBegin existante
      const durationInHours = this.convertDurationToHours(this.promotionForm.duration, this.durationUnit);

      dateBegin = new Date(); // Nouvelle date de début = maintenant
      dateEnd = new Date();
      dateEnd.setHours(dateEnd.getHours() + durationInHours);
    } else {
      // Mode dates : utiliser les dates saisies
      dateBegin = new Date(this.promotionForm.dateBegin);
      dateEnd = new Date(this.promotionForm.dateEnd);
    }

    const promotion: Promotion = {
      _id: this.promotion._id,
      variantId: this.variant._id!,
      typePromotion: this.promotionForm.typePromotion,
      value: this.promotionForm.value!,
      dateBegin: dateBegin,
      dateEnd: dateEnd
    };

    this.boutiqueService.updatePromotion(promotion)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success('Promotion mise à jour avec succès');
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
