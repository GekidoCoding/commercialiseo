import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterComponent } from '../register-component/register-component';
import {AuthService} from '../../services/auth-service';
import { ChangeDetectorRef } from '@angular/core';
import {ForgetPassword} from '../forget-password/forget-password';

@Component({
  selector: 'app-login',
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.css'],
  standalone: false
})
export class LoginComponent implements OnInit {

  errorMessage: string = '';

  constructor(
    public modalService: NgbModal,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializePasswordToggle();
  }

  /**
   * Initialise le bouton pour afficher/masquer le mot de passe
   */
  private initializePasswordToggle(): void {
    setTimeout(() => {
      const toggleButton = document.querySelector('.password-toggle') as HTMLButtonElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;

      if (!toggleButton || !passwordInput) return;

      toggleButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Changer l'icône
        const icon = toggleButton.querySelector('svg');
        if (icon) {
          if (type === 'text') {
            // Icône œil barré
            icon.innerHTML = `
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            `;
          } else {
            // Icône œil normal
            icon.innerHTML = `
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            `;
          }
        }
      });
    }, 0);
  }

  /**
   * Gestion de la soumission du formulaire
   */
  onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage = ''; // Réinitialiser le message d'erreur

    const form = event.target as HTMLFormElement;
    const email = (form.querySelector('#email') as HTMLInputElement).value;
    const password = (form.querySelector('#password') as HTMLInputElement).value;
    const remember = (form.querySelector('#remember') as HTMLInputElement).checked;

    // Validation
    if (!email || !password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    if (!this.isValidEmail(email)) {
      this.errorMessage = 'Veuillez entrer une adresse email valide';
      return;
    }

    // Appel API pour connexion
    this.authService.login(email, password, remember).subscribe({
      next: (response: any) => {
        console.log('Connexion réussie:', response);
        alert('Connexion réussie ! Bienvenue sur Commersialiseo ');
        this.modalService.dismissAll();
      },
      error: (err: { message: string; }) => {
        const apiMessage = err.message || '';
        if (apiMessage.includes('Utilisateur')) {
          this.errorMessage = 'Email inexistant, inscrivez-vous';
        } else if (apiMessage.includes('Mot de passe')) {
          this.errorMessage = 'Mot de passe incorrect';
        } else {
          this.errorMessage = 'Erreur de connexion. Veuillez réessayer.';
        }
        this.cdr.detectChanges(); // Force la détection des changements
      }
    });
  }

  /**
   * Ouvre le modal d'inscription
   */
  openRegister(): void {
    this.modalService.dismissAll();
    this.modalService.open(RegisterComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'xl'  // ou 'lg'
    });
  }

  /**
   * Mot de passe oublié
   */
  onForgotPassword(): void {
    this.modalService.dismissAll();
    this.modalService.open(ForgetPassword, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'xl'  // ou 'lg'
    });
  }
  /**
   * Valide le format de l'email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
