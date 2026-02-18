import { Component, inject, OnInit, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private router = inject(Router);

  searchQuery    = '';
  searchFocused  = false;
  mobileSearchOpen = signal(false);

  // Badges
  cartCount = signal(3);
  notifCount = signal(7);

  // Dropdowns
  cartOpen = signal(false);
  notifOpen = signal(false);
  mobileMenuOpen = signal(false);
  userMenuOpen = signal(false);

  // Scroll state
  isScrolled = signal(false);

  // Mock data
  cartItems = [
    { id: 1, name: 'Produit Alpha', price: 29.99, qty: 1, img: '🛍️' },
    { id: 2, name: 'Produit Beta',  price: 49.99, qty: 2, img: '📦' },
  ];

  notifications = [
    { id: 1, text: 'Nouvelle commande reçue',        time: 'Il y a 2 min',  read: false, icon: '🛒' },
    { id: 2, text: 'Votre produit a été expédié',    time: 'Il y a 1h',    read: false, icon: '📬' },
    { id: 3, text: 'Promotion disponible',            time: 'Il y a 3h',    read: false, icon: '🎉' },
    { id: 4, text: 'Paiement confirmé',               time: 'Hier',         read: true,  icon: '✅' },
    { id: 5, text: 'Nouveau message',                 time: 'Hier',         read: true,  icon: '💬' },
  ];

  userConnected = {
    username: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    role: 'admin'
  };

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 10);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-action-btn') && !target.closest('.dropdown-panel')) {
      this.cartOpen.set(false);
      this.notifOpen.set(false);
      this.userMenuOpen.set(false);
    }
    if (!target.closest('.mobile-menu-btn') && !target.closest('.mobile-nav')) {
      this.mobileMenuOpen.set(false);
    }
  }

  ngOnInit() {}

  toggleMobileSearch() {
    this.mobileSearchOpen.set(!this.mobileSearchOpen());
    this.mobileMenuOpen.set(false); // ferme le menu si ouvert
  }

  toggleCart(event: Event) {
    event.stopPropagation();
    const next = !this.cartOpen();
    this.cartOpen.set(next);
    this.notifOpen.set(false);
    this.userMenuOpen.set(false);
  }

  toggleNotif(event: Event) {
    event.stopPropagation();
    const next = !this.notifOpen();
    this.notifOpen.set(next);
    this.cartOpen.set(false);
    this.userMenuOpen.set(false);
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    const next = !this.userMenuOpen();
    this.userMenuOpen.set(next);
    this.cartOpen.set(false);
    this.notifOpen.set(false);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  markAllRead() {
    this.notifications.forEach(n => n.read = true);
    this.notifCount.set(0);
  }

  removeFromCart(id: number) {
    const idx = this.cartItems.findIndex(c => c.id === id);
    if (idx > -1) {
      this.cartItems.splice(idx, 1);
      this.cartCount.set(this.cartItems.length);
    }
  }

  get cartTotal(): number {
    return this.cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  getUserInitials(): string {
    return (this.userConnected.username || this.userConnected.email || '').slice(0, 2).toUpperCase();
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
