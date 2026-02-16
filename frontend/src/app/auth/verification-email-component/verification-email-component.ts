import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-email-verification',
  templateUrl: './verification-email-component.html',
  styleUrls: ['./verification-email-component.css'],
  standalone: false
})
export class VerificationEmailComponent implements OnInit, OnDestroy {

  @Input() email: string = '';

  verificationCode: string[] = ['', '', '', '', '', '', ''];
  timeRemaining: number = 600; // 10 minutes en secondes (600 secondes)
  timerInterval: any;

  resendDisabled: boolean = true;
  resendCountdown: number = 60; // 60 secondes avant de pouvoir renvoyer
  resendInterval: any;

  constructor(public modalService: NgbModal) {}

  ngOnInit(): void {
    this.startTimer();
    this.startResendCountdown();

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
   * Démarre le timer du code de vérification (10 minutes)
   */
  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;

      if (this.timeRemaining <= 0) {
        clearInterval(this.timerInterval);
        alert('Le code de vérification a expiré après 10 minutes. Le modal va se fermer.');
        // Ferme automatiquement le modal après 10 minutes
        this.modalService.dismissAll();
      }
    }, 1000); // Décompte chaque seconde
  }

  /**
   * Démarre le countdown pour réactiver le bouton de renvoi (60 secondes)
   */
  private startResendCountdown(): void {
    this.resendInterval = setInterval(() => {
      if (this.resendCountdown > 0) {
        this.resendCountdown--;
      }

      if (this.resendCountdown <= 0) {
        this.resendDisabled = false;
        clearInterval(this.resendInterval);
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

    if (!this.isCodeComplete()) {
      alert('Veuillez entrer le code complet');
      return;
    }

    const code = this.getFullCode();
    console.log('Code de vérification:', code);
    console.log('Email:', this.email);

    // Simulation de la vérification
    // Remplacer par l'appel API réel
    this.verifyCode(code);
  }

  /**
   * Vérifie le code auprès du backend
   */
  private verifyCode(code: string): void {
    // TODO: Appel API pour vérifier le code
    // Simulation pour démonstration
    if (code === '1234567') {
      alert('Email vérifié avec succès ! 🎉');
      this.modalService.dismissAll();
    } else {
      alert('Code incorrect. Veuillez réessayer.');
      this.clearCodeInputs();
    }
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
        input.classList.add('error');
        setTimeout(() => input.classList.remove('error'), 300);
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

    if (this.resendDisabled) {
      return;
    }

    console.log('Renvoi du code à:', this.email);

    // TODO: Appel API pour renvoyer le code
    alert('Un nouveau code a été envoyé à ' + this.email);

    // Réinitialise les timers
    this.clearTimers();
    this.timeRemaining = 600; // Réinitialise à 10 minutes
    this.resendCountdown = 60; // Réinitialise à 60 secondes
    this.resendDisabled = true;
    this.startTimer();
    this.startResendCountdown();

    // Efface les inputs
    this.clearCodeInputs();
  }

  /**
   * Valide le format de l'email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
