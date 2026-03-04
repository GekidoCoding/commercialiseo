import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterComponent } from '../register-component/register-component';
import { AuthService } from '../../services/auth-service';
import { ForgetPassword } from '../forget-password/forget-password';
import { AuthUtilService } from '../../../../shared/services/auth-util.service';
import { User } from '../../models/User';

@Component({
  selector: 'app-login',
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.css'],
  standalone: false
})
export class LoginComponent implements OnInit {

  // Champs du formulaire
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;

  // UI states
  showPassword: boolean = false;
  isSubmitting: boolean = false;
  showError: boolean = false;
  errorMessage: string = '';

  constructor(
    public modalService: NgbModal,
    private authService: AuthService,
    private authUtil: AuthUtilService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  /** Bascule l'affichage du mot de passe */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /** Valide le format de l'email */
  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  /** Vérifie si le formulaire est valide pour activer le bouton */
  isFormValid(): boolean {
    return this.isEmailValid() && this.password.length > 0;
  }

  /** Soumission du formulaire */
  onSubmit(event: Event): void {
    event.preventDefault();

    // Réinitialiser l'erreur
    this.showError = false;
    this.errorMessage = '';

    // Validation
    if (!this.isEmailValid()) {
      this.showError = true;
      this.errorMessage = 'Veuillez entrer une adresse email valide';
      return;
    }

    if (!this.password) {
      this.showError = true;
      this.errorMessage = 'Veuillez entrer votre mot de passe';
      return;
    }

    this.isSubmitting = true;

    // Nettoyer TOUT le storage avant de se connecter
    this.authUtil.clearAllStorage();

    this.authService.login(this.email, this.password, this.rememberMe).subscribe({
      next: async (response: any) => {
        this.isSubmitting = false;
        console.log('Connexion réussie:', response.data);

        // Stocker le token
        if (this.rememberMe) {
          localStorage.setItem('authToken', response.data.token);
        } else {
          sessionStorage.setItem('authToken', response.data.token);
        }

        // Stocker les données utilisateur
        if (response.data.user) {
          this.authUtil.storeUser(response.data.user, this.rememberMe);
        } else if (response.data.email || response.data.username || response.data.role) {
          const tempUser = new User();
          tempUser.email = response.data.email || this.email;
          tempUser.username = response.data.username || '';
          if (response.data.role) {
            tempUser.setRole(response.data.role);
          }
          this.authUtil.storeUser(tempUser, this.rememberMe);
        }

        try {
          await this.authUtil.navigateAfterLogin();
        } catch (err) {
          console.error('Erreur lors de la navigation :', err);
        }

        this.modalService.dismissAll();
      },
      error: (err: { message?: string }) => {
        this.isSubmitting = false;
        this.showError = true;

        const errorMsg = err.message || '';

        if (errorMsg.includes('Email') || errorMsg.includes('introuvable')) {
          this.errorMessage = 'Aucun compte trouvé avec cet email';
        } else if (errorMsg.includes('password') || errorMsg.includes('mot de passe')) {
          this.errorMessage = 'Mot de passe incorrect';
        } else if (errorMsg.includes('Erreur serveur')) {
          this.errorMessage = 'Erreur serveur, veuillez réessayer plus tard';
        } else {
          this.errorMessage = 'Email ou mot de passe incorrect';
        }

        this.cdr.detectChanges();
      }
    });
  }

  /** Ouvre le modal d'inscription */
  openRegister(): void {
    this.modalService.dismissAll();
    this.modalService.open(RegisterComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'xl'
    });
  }

  /** Mot de passe oublié */
  onForgotPassword(): void {
    this.modalService.dismissAll();
    this.modalService.open(ForgetPassword, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'xl'
    });
  }
}
