import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth-service';
import { LoginComponent } from '../login-component/login-component';
import { User } from '../../models/User';
import {ForgetPassword} from '../forget-password/forget-password';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css'],
  standalone: false
})
export class ChangePassword implements OnInit, OnDestroy {
  @Input() email: string = '';

  user: User = new User();
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  verificationCode: string[] = ['', '', '', '', '', '', ''];
  timeRemaining: number = 120; // 2 minutes
  timerInterval: any;

  resendDisabled: boolean = true;
  resendCountdown: number = 60;
  resendInterval: any;

  passwordStrength: PasswordStrength = {
    score: 0,
    label: 'Trop court',
    color: '#e74c3c',
    width: '0%'
  };

  isSubmitting: boolean = false;
  showError: boolean = false;
  errorMessage: string = '';

  constructor(
    public modalService: NgbModal,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.startTimer();
    this.startResendCountdown();

    setTimeout(() => {
      const firstInput = document.getElementById('code-0') as HTMLInputElement;
      if (firstInput) firstInput.focus();
    }, 100);
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        clearInterval(this.timerInterval);
        this.showError = true;
        this.errorMessage = 'Le code de vérification a expiré. Veuillez en demander un nouveau.';
        this.clearCodeInputs();
      }
    }, 1000);
  }

  private startResendCountdown(): void {
    this.resendInterval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        clearInterval(this.resendInterval);
        this.resendDisabled = false;
      }
    }, 1000);
  }

  private clearTimers(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.resendInterval) clearInterval(this.resendInterval);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  onCodeInput(event: any, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase();

    if (value && !/^[A-Z0-9]$/.test(value)) {
      input.value = '';
      return;
    }

    input.value = value;
    this.verificationCode[index] = value;

    if (value && index < 6) {
      const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  onCodeKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      if (!input.value && index > 0) {
        const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
          prevInput.select();
        }
      } else {
        this.verificationCode[index] = '';
      }
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }

    if (event.key === 'ArrowRight' && index < 6) {
      const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  onCodePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const characters = pastedData.toUpperCase().replace(/[^A-Z0-9]/g, '').split('').slice(0, 7);

    characters.forEach((char, index) => {
      this.verificationCode[index] = char;
      const input = document.getElementById(`code-${index}`) as HTMLInputElement;
      if (input) input.value = char;
    });

    const lastIndex = Math.min(characters.length - 1, 6);
    const lastInput = document.getElementById(`code-${lastIndex}`) as HTMLInputElement;
    if (lastInput) lastInput.focus();
  }

  isCodeComplete(): boolean {
    return this.verificationCode.every(digit => digit !== '');
  }

  getFullCode(): string {
    return this.verificationCode.join('');
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    this.showError = false;
    this.errorMessage = '';

    if (!this.isCodeComplete()) {
      this.showError = true;
      this.errorMessage = 'Veuillez entrer le code complet';
      return;
    }

    if (!this.isPasswordValid() || !this.passwordsMatch()) {
      this.showError = true;
      this.errorMessage = 'Veuillez vérifier le mot de passe et la confirmation';
      return;
    }

    const code = this.getFullCode();
    this.isSubmitting = true;

    // Assuming authService has a resetPassword method; adjust as needed
    this.authService.resetPassword(this.email, this.user.password ,code).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        setTimeout(() => {
          this.modalService.dismissAll();
          alert(' Mot de passe changé avec succès !');
          this.openLogin();
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.showError = true;
        const errorMsg = error.message || 'Une erreur est survenue';
        if (errorMsg || errorMsg!='') {
          this.errorMessage = errorMsg;
        }
        this.cdr.detectChanges();
      }
    });
  }

  private clearCodeInputs(): void {
    this.verificationCode = ['', '', '', '', '', '', ''];
    for (let i = 0; i < 7; i++) {
      const input = document.getElementById(`code-${i}`) as HTMLInputElement;
      if (input) input.value = '';
    }
    const firstInput = document.getElementById('code-0') as HTMLInputElement;
    if (firstInput) firstInput.focus();
  }

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

  onPasswordChange(): void {
    const pwd = this.user.password;
    if (pwd.length < 8) {
      this.passwordStrength = { score: 0, label: 'Trop court', color: '#e74c3c', width: '25%' };
      return;
    }

    let score = 0;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) score++;
    if (pwd.length >= 12) score++;

    if (score <= 2) {
      this.passwordStrength = { score: 1, label: 'Faible', color: '#e74c3c', width: '33%' };
    } else if (score === 3) {
      this.passwordStrength = { score: 2, label: 'Moyen', color: '#f39c12', width: '66%' };
    } else if (score === 4) {
      this.passwordStrength = { score: 3, label: 'Fort', color: '#3498db', width: '85%' };
    } else {
      this.passwordStrength = { score: 4, label: 'Très fort', color: '#27ae60', width: '100%' };
    }
  }

  isPasswordValid(): boolean {
    const pwd = this.user.password;
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /\d/.test(pwd) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
  }

  getPasswordValidationMessage(): string {
    const pwd = this.user.password;
    if (pwd.length < 8) return 'Minimum 8 caractères requis';

    const missing: string[] = [];
    if (!/[A-Z]/.test(pwd)) missing.push('une majuscule');
    if (!/\d/.test(pwd)) missing.push('un chiffre');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) missing.push('un caractère spécial');

    return missing.length > 0 ? `Manquant: ${missing.join(', ')}` : '';
  }

  hasMinLength(): boolean {
    return this.user.password.length >= 8;
  }

  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.user.password);
  }

  hasNumbers(): boolean {
    return /\d/.test(this.user.password);
  }

  hasSpecialChars(): boolean {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.user.password);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordsMatch(): boolean {
    return this.user.password === this.confirmPassword;
  }

  onResendCode(event: Event): void {
    event.preventDefault();
    if (this.resendDisabled) return;

    this.showError = false;
    this.errorMessage = '';

    this.authService.sendCodePassword(this.email,true).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('envoi réussie:', response);
      },
      error: (error) => {

        this.isSubmitting = false;
        this.showError = true;

        // Gestion des différents types d'erreurs
        const errorMsg = error.message || error;

        if (errorMsg || errorMsg!='') {
          this.errorMessage = errorMsg;
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l\'inscription';
        }
        this.cdr.detectChanges();
      }
    });

    this.clearTimers();
    this.timeRemaining = 240;
    this.resendDisabled = true;
    this.startTimer();
    this.clearCodeInputs();
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  openForgetPassword() {
    this.modalService.dismissAll();
    this.modalService.open(ForgetPassword, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'xl'
    });
  }
  openLogin() {
    this.modalService.dismissAll();
    this.modalService.open(LoginComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'xl'
    });
  }
}
