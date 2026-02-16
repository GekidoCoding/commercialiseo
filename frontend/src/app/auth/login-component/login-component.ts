import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-login',
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.css'],
  standalone:false
})
export class LoginComponent implements OnInit {

  constructor(public modalService: NgbModal) {}

  ngOnInit(): void {
    this.initializePasswordToggle();
    this.initializeRegisterLink();
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
              <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
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
    }, 100);
  }

  /**
   * Initialise le lien vers l'inscription
   */
  private initializeRegisterLink(): void {
    setTimeout(() => {
      const registerLink = document.getElementById('registerLink');
      if (registerLink) {
        registerLink.addEventListener('click', (e) => {
          e.preventDefault();
          // Ici vous pouvez ouvrir le modal d'inscription
          alert('Redirection vers l\'inscription - Ouvrir RegisterComponent');
          // Exemple : this.modalService.dismissAll();
          // this.modalService.open(RegisterComponent);
        });
      }
    }, 100);
  }

  /**
   * Gestion de la soumission du formulaire
   */
  onSubmit(event: Event): void {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const email = (form.querySelector('#email') as HTMLInputElement).value;
    const password = (form.querySelector('#password') as HTMLInputElement).value;
    const remember = (form.querySelector('#remember') as HTMLInputElement).checked;

    // Validation
    if (!email || !password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (!this.isValidEmail(email)) {
      alert('Veuillez entrer une adresse email valide');
      return;
    }

    // Simulation de connexion
    console.log('Connexion:', { email, password, remember });
    alert('Connexion réussie ! Bienvenue sur ShopMada 🎉');

    this.modalService.dismissAll();
  }

  /**
   * Connexion avec Google
   */
  onGoogleLogin(): void {
    console.log('Connexion avec Google');
    alert('Connexion avec Google en cours...');
    // Implémenter l'authentification Google OAuth2
  }

  /**
   * Connexion avec Facebook
   */
  onFacebookLogin(): void {
    console.log('Connexion avec Facebook');
    alert('Connexion avec Facebook en cours...');
    // Implémenter l'authentification Facebook
  }

  /**
   * Mot de passe oublié
   */
  onForgotPassword(): void {
    alert('Un email de réinitialisation va vous être envoyé');
    // Implémenter la logique de récupération de mot de passe
  }

  /**
   * Valide le format de l'email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
