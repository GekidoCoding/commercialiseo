import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {AuthUtilService} from '../../services/auth-util.service';

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
  role:string = '';
  constructor(
    private authUtilService:AuthUtilService
  ) {
  }
  ngOnInit(): void {
    this.role=this.authUtilService.getRole();
  }

  subscribeNewsletter(): void {
    if (!this.newsletterEmail || !this.validateEmail(this.newsletterEmail)) {
      alert('Veuillez entrer une adresse e-mail valide.');
      return;
    }
    // TODO : appel services newsletter
    console.log('Abonnement newsletter :', this.newsletterEmail);
    alert(`Merci ! Vous êtes bien inscrit avec l'adresse ${this.newsletterEmail}.`);
    this.newsletterEmail = '';
  }

  private validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
