import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {LoginComponent} from '../login-component/login-component';

@Component({
  selector: 'app-register',
  templateUrl: './register-component.html',
  styleUrls: ['./register-component.css'],
  standalone: false
})

export class RegisterComponent implements OnInit {

  constructor(public modalService: NgbModal) {}

  ngOnInit(): void {
    this.initializePasswordStrength();
    this.initializePasswordToggle();
  }

  /**
   * Initialise l'indicateur de force du mot de passe
   */
  private initializePasswordStrength(): void {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const strengthFill = document.querySelector('.strength-fill') as HTMLElement;
    const strengthText = document.querySelector('.strength-text') as HTMLElement;

    if (!passwordInput || !strengthFill || !strengthText) return;

    passwordInput.addEventListener('input', (event) => {
      const password = (event.target as HTMLInputElement).value;
      let strength = 0;

      // Calcul de la force
      if (password.length >= 8) strength += 25;
      if (password.length >= 12) strength += 25;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 12.5;
      if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;

      // Mise à jour visuelle
      strengthFill.style.width = strength + '%';

      if (strength < 25) {
        strengthFill.style.backgroundColor = '#ef4444';
        strengthText.textContent = 'Trop court';
        strengthText.style.color = '#ef4444';
      } else if (strength < 50) {
        strengthFill.style.backgroundColor = '#f59e0b';
        strengthText.textContent = 'Faible';
        strengthText.style.color = '#f59e0b';
      } else if (strength < 75) {
        strengthFill.style.backgroundColor = '#3b82f6';
        strengthText.textContent = 'Moyen';
        strengthText.style.color = '#3b82f6';
      } else {
        strengthFill.style.backgroundColor = '#059669';
        strengthText.textContent = 'Fort';
        strengthText.style.color = '#059669';
      }
    });
  }

  /**
   * Initialise le bouton pour afficher/masquer le mot de passe
   */
  private initializePasswordToggle(): void {
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
  }

  /**
   * Gestion de la soumission du formulaire
   */
  onSubmit(event: Event): void {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const email = (form.querySelector('#email') as HTMLInputElement).value;
    const password = (form.querySelector('#password') as HTMLInputElement).value;
    const terms = (form.querySelector('#terms') as HTMLInputElement).checked;

    // Validation
    if (!email || !password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (!terms) {
      alert('Veuillez accepter les conditions d\'utilisation');
      return;
    }

    // Simulation d'inscription
    console.log('Inscription:', { email, password });
    alert('Inscription réussie ! Bienvenue sur ShopMada 🎉');

    this.modalService.dismissAll();
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
}
