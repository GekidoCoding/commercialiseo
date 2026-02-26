import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  currentYear: number = new Date().getFullYear();
  newsletterEmail: string = '';

  ngOnInit(): void {}

  subscribeNewsletter(): void {
    if (!this.newsletterEmail || !this.validateEmail(this.newsletterEmail)) {
      alert('Veuillez entrer une adresse e-mail valide.');
      return;
    }
    // TODO : appel service newsletter
    console.log('Abonnement newsletter :', this.newsletterEmail);
    alert(`Merci ! Vous êtes bien inscrit avec l'adresse ${this.newsletterEmail}.`);
    this.newsletterEmail = '';
  }

  private validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
