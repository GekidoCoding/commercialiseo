import {Component, Input, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '../../services/auth-service';
import {LoginComponent} from '../login-component/login-component';
import {RegisterComponent} from '../register-component/register-component';

@Component({
  selector: 'app-email-verification',
  templateUrl: './verification-email-component.html',
  styleUrls: ['./verification-email-component.css'],
  standalone: false
})
export class VerificationEmailComponent implements OnInit, OnDestroy {

  @Input() email: string = '';
  verificationCode: string[] = ['', '', '', '', '', '', ''];
  timeRemaining: number = 240; // 4 minutes en secondes (240 secondes)
  timerInterval: any;

  resendDisabled: boolean = true;
  resendInterval: any;

  // États du formulaire
  isSubmitting: boolean = false;
  isSuccess: boolean = false;
  showError: boolean = false;
  errorMessage: string = '';

  constructor(
    public modalService: NgbModal,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.startTimer();

    // Focus sur le premier input
    setTimeout(() => {
      const firstInput = document.getElementById('code-0') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  /**
   * Démarre le timer du code de vérification (4 minutes)
   */
  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;

      if (this.timeRemaining <= 0) {
        clearInterval(this.timerInterval);
        this.showError = true;
        this.errorMessage = 'Le code de vérification a expiré. Veuillez en demander un nouveau.';
        this.clearCodeInputs();
      }
    }, 1000); // Décompte chaque seconde
  }


  /**
   * Nettoie tous les timers
   */
  private clearTimers(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }
  }

  /**
   * Formate le temps restant en MM:SS
   */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Gère la saisie dans un input de code
   */
  onCodeInput(event: any, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase(); // Convertit en majuscules

    // N'accepte que les chiffres et les lettres majuscules (A-Z, 0-9)
    if (value && !/^[A-Z0-9]$/.test(value)) {
      input.value = '';
      return;
    }

    // Met à jour l'input avec la valeur en majuscules
    input.value = value;

    // Stocke la valeur
    this.verificationCode[index] = value;

    // Passe au champ suivant si une valeur a été saisie
    if (value && index < 6) {
      const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  /**
   * Gère les touches spéciales (backspace, arrow keys)
   */
  onCodeKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    // Backspace
    if (event.key === 'Backspace') {
      if (!input.value && index > 0) {
        // Si le champ est vide, revenir au précédent
        const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
          prevInput.select();
        }
      } else {
        // Sinon, effacer le contenu actuel
        this.verificationCode[index] = '';
      }
    }

    // Flèche gauche
    if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }

    // Flèche droite
    if (event.key === 'ArrowRight' && index < 6) {
      const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  /**
   * Gère le collage d'un code complet
   */
  onCodePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    // Extrait uniquement les lettres (A-Z) et chiffres (0-9), converti en majuscules
    const characters = pastedData.toUpperCase().replace(/[^A-Z0-9]/g, '').split('').slice(0, 7);

    characters.forEach((char, index) => {
      this.verificationCode[index] = char;
      const input = document.getElementById(`code-${index}`) as HTMLInputElement;
      if (input) {
        input.value = char;
      }
    });

    // Focus sur le dernier champ rempli ou le suivant
    const lastIndex = Math.min(characters.length, 6);
    const lastInput = document.getElementById(`code-${lastIndex}`) as HTMLInputElement;
    if (lastInput) {
      lastInput.focus();
    }
  }

  /**
   * Vérifie si le code est complet
   */
  isCodeComplete(): boolean {
    return this.verificationCode.every(digit => digit !== '');
  }

  /**
   * Récupère le code complet
   */
  getFullCode(): string {
    return this.verificationCode.join('');
  }

  /**
   * Gère la soumission du formulaire
   */
  onSubmit(event: Event): void {
    event.preventDefault();

    // Réinitialiser les erreurs
    this.showError = false;
    this.errorMessage = '';

    if (!this.isCodeComplete()) {
      this.showError = true;
      this.errorMessage = 'Veuillez entrer le code complet';
      return;
    }

    const code = this.getFullCode();
    this.isSubmitting = true;

    // Appel au service de vérification
    this.authService.verifyCode(this.email, code).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.isSuccess = true;

        // Animation de succès puis fermeture du modal après 3 secondes
        setTimeout(() => {
          // 1. Fermer le modal de vérification
          this.modalService.dismissAll();
          alert("✅ Compte créé avec succès ! ");
          this.openConnexion();
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.showError = true;

        // Gestion des différents types d'erreurs
        const errorMsg = error.message || error;

        if (errorMsg.includes('Code expiré')) {
          this.errorMessage = 'Le code a expiré. Veuillez en demander un nouveau.';
        } else if (errorMsg.includes('Code invalide')) {
          this.errorMessage = 'Code incorrect. Veuillez réessayer.';
          this.clearCodeInputs();
        } else if (errorMsg.includes('Erreur serveur')) {
          this.errorMessage = 'Erreur serveur, veuillez réessayer plus tard.';
        } else {
          this.errorMessage = 'Une erreur est survenue lors de la vérification.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Efface tous les inputs du code
   */
  private clearCodeInputs(): void {
    this.verificationCode = ['', '', '', '', '', '', ''];
    for (let i = 0; i < 7; i++) {
      const input = document.getElementById(`code-${i}`) as HTMLInputElement;
      if (input) {
        input.value = '';
        input.classList.add('error-shake');
        setTimeout(() => input.classList.remove('error-shake'), 500);
      }
    }
    // Focus sur le premier input
    const firstInput = document.getElementById('code-0') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }

  /**
   * Gère le clic sur le bouton de modification de l'email
   */
  onEditEmail(): void {
    const newEmail = prompt('Entrez votre nouvelle adresse email:', this.email);
    if (newEmail && this.isValidEmail(newEmail)) {
      this.email = newEmail;
      this.showError = false;
      this.errorMessage = '';
      alert('Email mis à jour. Un nouveau code va vous être envoyé.');
      this.onResendCode(new Event('click'));
    } else if (newEmail) {
      alert('Adresse email invalide');
    }
  }

  /**
   * Renvoie un nouveau code de vérification
   */

  onResendCode(event: Event): void {
    event.preventDefault();
    console.log( "resend code :"+this.email);
    this.authService.sendCodePassword(this.email,false).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('envoi réussie:', response);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.showError = true;

        // Gestion des différents types d'erreurs
        const errorMsg = error.message || error;

        if (errorMsg && errorMsg !== '') { // Corrigé : Condition simplifiée (évite la redondance)
          this.errorMessage = errorMsg;
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l\'inscription';
        }
        this.cdr.detectChanges();
      }
    });

    // Réinitialise les timers et le countdown pour le renvoi
    this.clearTimers();
    this.timeRemaining = 240;
    this.resendDisabled = true;
    this.startTimer();
    this.clearCodeInputs();
  }


  /**
   * Valide le format de l'email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  openConnexion() {
    this.modalService.dismissAll();
    this.modalService.open(LoginComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'xl'  // ou 'lg'
    });
  }


  openRegister() {
    this.modalService.dismissAll();
    this.modalService.open(RegisterComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'xl'  // ou 'lg'
    });
  }
}
