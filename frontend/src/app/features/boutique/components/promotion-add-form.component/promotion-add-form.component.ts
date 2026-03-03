import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { BoutiqueService } from '../../services/boutique.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { VariantRead } from '../../../../shared/model/variant-read';
import { Promotion } from '../../../../shared/model/promotion';
import { PromotionType } from '../../../../shared/constants/promotion-type';

@Component({
  selector: 'app-promotion-add-form',
  templateUrl: './promotion-add-form.component.html',
  styleUrls: ['./promotion-add-form.component.css'],
  standalone: false
})
export class PromotionAddFormComponent implements OnInit {

  @Input() variant!: VariantRead;

  // Constantes des types de promotion
  readonly PromotionType = PromotionType;

  // Champs read-only affichés
  variantCode: string = '';
  variantSpecificAttributes: { key: string; value: string }[] = [];

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

    // Convertir specificAttributes en tableau affichable
    if (this.variant.specificAttributes) {
      this.variantSpecificAttributes = Object.entries(this.variant.specificAttributes).map(
        ([key, value]) => ({
          key,
          value: Array.isArray(value) ? value.join(', ') : String(value)
        })
      );
    }
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
      // PRICE et DISCOUNT : montant fixe à réduire
      this.prixAvecPromo = Math.max(0, this.variant.price - this.promotionForm.value);
    }
  }

  // ==================== GESTION DURATION ====================

  onDateModeChange(mode: 'duration' | 'dates'): void {
    this.dateInputMode = mode;
    if (mode === 'duration') {
      this.promotionForm.dateBegin = '';
      this.promotionForm.dateEnd = '';
    } else {
      this.promotionForm.duration = null;
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

    let promotion: Promotion;

    if (this.dateInputMode === 'duration' && this.promotionForm.duration) {
      // Mode duration : envoyer uniquement la duration en heures
      const durationInHours = this.convertDurationToHours(this.promotionForm.duration, this.durationUnit);

      promotion = {
        variantId: this.variant._id!,
        typePromotion: this.promotionForm.typePromotion,
        value: this.promotionForm.value!,
        duration: durationInHours
        // dateBegin et dateEnd ne sont pas envoyés (undefined)
      };
    } else {
      // Mode dates : envoyer dateBegin et dateEnd
      promotion = {
        variantId: this.variant._id!,
        typePromotion: this.promotionForm.typePromotion,
        value: this.promotionForm.value!,
        dateBegin: new Date(this.promotionForm.dateBegin),
        dateEnd: new Date(this.promotionForm.dateEnd)
        // duration n'est pas envoyé (undefined)
      };
    }

    this.boutiqueService.createPromotion(promotion)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success('Promotion créée avec succès');
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
