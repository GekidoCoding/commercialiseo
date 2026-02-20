import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '../../services/auth-service';
import {LoginComponent} from '../login-component/login-component';
import {VerificationEmailComponent} from '../verification-email-component/verification-email-component';
import {User} from '../../models/User';



@Component({
  selector: 'app-register',
  templateUrl: './register-component.html',
  styleUrls: ['./register-component.css'],
  standalone: false,
})
export class RegisterComponent implements OnInit {
  user: User = new User();
  role :string = '';
  confirmPassword: string = '';
  termsAccepted: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  passwordStrength: PasswordStrength = {
    score: 0,
    label: 'Trop court',
    color: '#e74c3c',
    width: '0%'
  };

  // États du formulaire
  isSubmitting: boolean = false;
  errorMessage: string = '';
  showError: boolean = false;

  constructor(
    public modalService: NgbModal,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user.role = this.user.roles[0];
  }

  /**
   * Sélectionne un rôle
   */
  selectRole(role: string): void {
    try {
      this.user.setRole(role);
    } catch (error: any) {
      console.error(error.message);
      this.showError = true;
      this.errorMessage = error.message;
    }
  }

  /**
   * Obtient le label traduit du rôle
   */
  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'admin': 'Administrateur',
      'acheteur': 'Acheteur',
      'boutique': 'Boutique'
    };
    return labels[role] || role;
  }

  /**
   * Obtient la description du rôle
   */
  getRoleDescription(role: string): string {
    const descriptions: { [key: string]: string } = {
      'admin': 'Gérer la plateforme',
      'acheteur': 'Acheter des produits',
      'boutique': 'Vendre des produits'
    };
    return descriptions[role] || '';
  }

  /**
   * Calcule la force du mot de passe
   */
  onPasswordChange(): void {
    const pwd = this.user.password;

    if (pwd.length === 0) {
      this.passwordStrength = {
        score: 0,
        label: 'Trop court',
        color: '#e74c3c',
        width: '0%'
      };
      return;
    }

    if (pwd.length < 8) {
      this.passwordStrength = {
        score: 0,
        label: 'Trop court',
        color: '#e74c3c',
        width: '25%'
      };
      return;
    }

    let score = 0;
    const checks = {
      hasUpperCase: /[A-Z]/.test(pwd),
      hasLowerCase: /[a-z]/.test(pwd),
      hasNumbers: /\d/.test(pwd),
      hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      isLongEnough: pwd.length >= 8,
      isVeryLong: pwd.length >= 12
    };

    // Calcul du score
    if (checks.hasUpperCase) score++;
    if (checks.hasLowerCase) score++;
    if (checks.hasNumbers) score++;
    if (checks.hasSpecialChars) score++;
    if (checks.isVeryLong) score++;

    // Déterminer la force
    if (score <= 2) {
      this.passwordStrength = {
        score: 1,
        label: 'Faible',
        color: '#e74c3c',
        width: '33%'
      };
    } else if (score === 3) {
      this.passwordStrength = {
        score: 2,
        label: 'Moyen',
        color: '#f39c12',
        width: '66%'
      };
    } else if (score === 4) {
      this.passwordStrength = {
        score: 3,
        label: 'Fort',
        color: '#3498db',
        width: '85%'
      };
    } else {
      this.passwordStrength = {
        score: 4,
        label: 'Très fort',
        color: '#27ae60',
        width: '100%'
      };
    }
  }

  /**
   * Vérifie si le mot de passe a au moins 8 caractères
   */
  hasMinLength(): boolean {
    return this.user.password.length >= 8;
  }

  /**
   * Vérifie si le mot de passe contient une majuscule
   */
  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.user.password);
  }

  /**
   * Vérifie si le mot de passe contient un chiffre
   */
  hasNumbers(): boolean {
    return /\d/.test(this.user.password);
  }

  /**
   * Vérifie si le mot de passe contient un caractère spécial
   */
  hasSpecialChars(): boolean {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.user.password);
  }

  /**
   * Valide le mot de passe selon les critères obligatoires
   */
  isPasswordValid(): boolean {
    const pwd = this.user.password;

    if (pwd.length < 8) return false;

    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);

    return hasUpperCase && hasNumbers && hasSpecialChars;
  }

  /**
   * Obtient le message d'erreur pour le mot de passe
   */
  getPasswordValidationMessage(): string {
    const pwd = this.user.password;

    if (pwd.length === 0) return '';
    if (pwd.length < 8) return 'Minimum 8 caractères requis';

    const missing: string[] = [];

    if (!/[A-Z]/.test(pwd)) missing.push('une majuscule');
    if (!/\d/.test(pwd)) missing.push('un chiffre');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) missing.push('un caractère spécial');

    if (missing.length > 0) {
      return `Manquant: ${missing.join(', ')}`;
    }

    return '';
  }

  /**
   * Bascule l'affichage du mot de passe
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Bascule l'affichage du mot de passe de confirmation
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Vérifie si les mots de passe correspondent
   */
  passwordsMatch(): boolean {
    if (this.confirmPassword.length === 0) return true; // Pas d'erreur si vide
    return this.user.password === this.confirmPassword;
  }

  /**
   * Valide l'email
   */
  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.user.email);
  }

  /**
   * Vérifie si le formulaire est valide
   */
  isFormValid(): boolean {
    return this.isEmailValid() &&
      this.user.username.length > 0 &&
      this.role.length > 0 &&
      this.isPasswordValid() &&
      this.passwordsMatch() &&
      this.confirmPassword.length > 0 &&
      this.termsAccepted;
  }

  /**
   * Soumet le formulaire d'inscription
   */
  onSubmit(event:Event): void {
    // Réinitialiser les erreurs
    event.preventDefault();
    this.showError = false;
    this.errorMessage = '';

    // Validation finale
    if (!this.isFormValid()) {
      this.showError = true;

      if (!this.role) {
        this.errorMessage = 'Veuillez sélectionner un type de compte';
      } else if (!this.passwordsMatch()) {
        this.errorMessage = 'Les mots de passe ne correspondent pas';
      } else {
        this.errorMessage = 'Veuillez remplir tous les champs correctement';
      }
      return;
    }
    this.user.role = this.role;
    this.isSubmitting = true;
    console.log("role user:"+ this.user.role);
   console.log("role input:"+ this.role);
    // Appel au service d'authentification
    this.authService.registerRequest(this.user.email,this.user.username, this.user.password , this.role).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('Inscription réussie:', response);

        // Fermer le modal actuel
        this.modalService.dismissAll();
        this.openVerification();
      },
      error: (error) => {

        this.isSubmitting = false;
        this.showError = true;

        // Gestion des différents types d'erreurs
        const errorMsg = error.message || error;

        if (errorMsg.includes('Email') || errorMsg.includes('déjà un compte')) {
          this.errorMessage = 'Cet email a déjà un compte , connectez-vous ';
          console.log(this.errorMessage);
        } else if (errorMsg.includes('Erreur serveur')) {
          this.errorMessage = 'Erreur serveur, veuillez réessayer plus tard';
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l\'inscription';
        }
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Ouvre le modal de connexion
   */
  openConnexion() {
    this.modalService.dismissAll();
    this.modalService.open(LoginComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'xl'  // ou 'lg'
    });
  }

  openVerification() {
    this.modalService.dismissAll();
    const modal=this.modalService.open(VerificationEmailComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'xl'  // ou 'lg'
    });
    modal.componentInstance.email=this.user.email;
  }
}
