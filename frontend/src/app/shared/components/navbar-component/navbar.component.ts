import { Component, inject, OnInit, OnDestroy, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {environment} from '../../../../environments/environment';
import {CartItem} from '../../../features/acheteur/model/cart-item';
import {CartEventService} from '../../../features/acheteur/services/cart-event-service';
import {takeUntil} from 'rxjs/operators';
import { Subject } from 'rxjs';
import {AuthUtilService} from '../../services/auth-util.service';
import {User} from '../../../features/auth/models/User';

const CART_KEY = 'cart_variants';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private storageListener!: (e: StorageEvent) => void;
  private destroy$ = new Subject<void>();
  readonly serveurUrl = environment.apiUrl;
  readonly placeholderImg = 'assets/images/placeholder-product.png';

  // ── Signals ──────────────────────────────────────────
  isMobile      = signal(false);
  mobileNavOpen = signal(false);
  cartOpen      = signal(false);
  notifOpen     = signal(false);
  userMenuOpen  = signal(false);
  isScrolled    = signal(false);
  cartCount     = signal(0);
  notifCount    = signal(7);

  // ── Panier ────────────────────────────────────────────
  cartItems: CartItem[] = [];
  cartEditMode = false;
  reviewEditMode = false;
  // ── Modal confirmation commande ───────────────────────
  orderModalOpen    = false;
  orderConfirmStep: 'review' | 'password' = 'review';
  confirmPassword   = '';
  passwordError     = '';
  isSubmittingOrder = false;

  // ── Données mock ──────────────────────────────────────
  notifications = [
    { id: 1, text: 'Nouvelle commande reçue',      time: 'Il y a 2 min', read: false, icon: '🛒' },
    { id: 2, text: 'Votre produit a été expédié',  time: 'Il y a 1h',    read: false, icon: '📬' },
    { id: 3, text: 'Promotion disponible',          time: 'Il y a 3h',    read: false, icon: '🎉' },
    { id: 4, text: 'Paiement confirmé',             time: 'Hier',         read: true,  icon: '✅' },
    { id: 5, text: 'Nouveau message',               time: 'Hier',         read: true,  icon: '💬' },
  ];

  userConnected: User |null = null;

  // ════════════════════════════════════════════════════
  // LIFECYCLE
  // ════════════════════════════════════════════════════
  constructor(private cartEventService: CartEventService ,
              private authService:AuthUtilService
              ) {}
  ngOnInit(): void {
    this.userConnected= this.authService.getUserFromStorage();
    this.checkMobile();
    this.loadCartFromStorage();
    this.cartEventService.cartUpdated
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadCartFromStorage());

    // Synchronisation multi-onglets
    this.storageListener = (e: StorageEvent) => {
      if (e.key === CART_KEY) this.loadCartFromStorage();
    };
    window.addEventListener('storage', this.storageListener);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('storage', this.storageListener);
  }

  // ════════════════════════════════════════════════════
  // PANIER — LECTURE / SAUVEGARDE
  // ════════════════════════════════════════════════════

  /** Charge le panier depuis localStorage / sessionStorage et met à jour les signals */
  loadCartFromStorage(): void {
    try {
      const json = localStorage.getItem(CART_KEY) || sessionStorage.getItem(CART_KEY);
      const parsed: CartItem[] = json ? JSON.parse(json) : [];
      this.cartItems = Array.isArray(parsed) ? parsed : [];
    } catch {
      this.cartItems = [];
    }
    this.cartCount.set(this.cartItems.length);
  }

  /** Sauvegarde le panier dans localStorage ET sessionStorage */
  private saveCart(): void {
    const json = JSON.stringify(this.cartItems);
    localStorage.setItem(CART_KEY, json);
    sessionStorage.setItem(CART_KEY, json);
    this.cartCount.set(this.cartItems.length);
  }

  // ════════════════════════════════════════════════════
  // PANIER — CALCULS
  // ════════════════════════════════════════════════════

  /** Prix effectif d'un item (promo appliquée si active) */
  getItemEffectivePrice(item: CartItem): number {
    const variant = item.variant;
    if (!variant.promotions?.length) return variant.price;

    const now = new Date();
    const promo = variant.promotions.find((p: any) => {
      const begin = new Date(p.dateBegin);
      const end   = new Date(p.dateEnd);
      return now >= begin && now <= end;
    });

    if (!promo) return variant.price;
    if (promo.typePromotion === 'REMISE') return variant.price * (1 - promo.value / 100);
    return Math.max(0, variant.price - promo.value);
  }

  /** Sous-total d'une ligne = prix effectif × quantité */
  getItemSubtotal(item: CartItem): number {
    return this.getItemEffectivePrice(item) * item.quantity;
  }

  /** Total général du panier */
  get cartGrandTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + this.getItemSubtotal(item), 0);
  }

  // ════════════════════════════════════════════════════
  // PANIER — ÉDITION
  // ════════════════════════════════════════════════════

  toggleEditMode(event: Event): void {
    event.stopPropagation();
    this.cartEditMode = !this.cartEditMode;
  }

  onCartQtyChange(item: CartItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    const maxStock = item.variant.stock + item.quantity;

    if (isNaN(value) || value < 1) value = 1;
    if (value > maxStock)           value = maxStock;

    item.quantity = value;
    input.value   = value.toString();
    this.saveCart();
  }

  decrementCartQty(item: CartItem, event: Event): void {
    event.stopPropagation();
    if (item.quantity > 1) {
      item.quantity--;
      this.saveCart();
    }
  }

  incrementCartQty(item: CartItem, event: Event): void {
    event.stopPropagation();
    const maxStock = item.variant.stock + item.quantity;
    if (item.quantity < maxStock) {
      item.quantity++;
      this.saveCart();
    }
  }

  removeCartItem(item: CartItem, event: Event): void {
    event.stopPropagation();
    this.cartItems = this.cartItems.filter(i =>
      i.variant._id !== item.variant._id && i.variant.code !== item.variant.code
    );
    this.saveCart();
  }

  // ════════════════════════════════════════════════════
  // PANIER — HELPERS AFFICHAGE
  // ════════════════════════════════════════════════════

  getCartItemImage(item: CartItem): string {
    const variant = item.variant;
    if (!variant.images?.length) return this.placeholderImg;

    const img = variant.images.find((i: any) => i.isMain || i.main) || variant.images[0];
    if (!img?.url) return this.placeholderImg;

    return this.serveurUrl + (img.url.startsWith('/') ? img.url : '/' + img.url);
  }

  getCartItemAttrs(item: CartItem): { key: string; value: string }[] {
    const attrs = item.variant.specificAttributes;
    if (!attrs) return [];
    return Object.entries(attrs).map(([key, value]) => ({
      key,
      value: Array.isArray(value) ? value.join(', ') : String(value)
    }));
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = this.placeholderImg;
  }

  // ════════════════════════════════════════════════════
  // MODAL CONFIRMATION COMMANDE
  // ════════════════════════════════════════════════════

  openOrderConfirmation(event: Event): void {
    event.stopPropagation();
    this.orderModalOpen   = true;
    this.orderConfirmStep = 'review';
    this.confirmPassword  = '';
    this.passwordError    = '';
    this.reviewEditMode   = false; // ← reset
    this.cartOpen.set(false);
  }

  closeOrderModal(): void {
    this.orderModalOpen    = false;
    this.confirmPassword   = '';
    this.passwordError     = '';
    this.isSubmittingOrder = false;
  }

  goToPasswordStep(): void {
    this.orderConfirmStep = 'password';
  }

  submitOrder(): void {
    if (!this.confirmPassword) {
      this.passwordError = 'Veuillez saisir votre mot de passe.';
      return;
    }
    this.isSubmittingOrder = true;
    this.passwordError     = '';

    // TODO : remplacer par votre appel service réel
    // this.orderService.confirm(this.cartItems, this.confirmPassword).subscribe({
    //   next: () => { this.closeOrderModal(); this.cartItems = []; this.saveCart(); },
    //   error: (err) => { this.passwordError = err.message; this.isSubmittingOrder = false; }
    // });

    // Simulation temporaire :
    setTimeout(() => {
      this.isSubmittingOrder = false;
      this.closeOrderModal();
      this.cartItems = [];
      this.saveCart();
    }, 1500);
  }

  // ════════════════════════════════════════════════════
  // NAVIGATION / DROPDOWNS
  // ════════════════════════════════════════════════════

  toggleCart(event: Event): void {
    event.stopPropagation();
    const next = !this.cartOpen();
    if (next) this.loadCartFromStorage(); // rafraîchit à l'ouverture
    this.cartOpen.set(next);
    this.notifOpen.set(false);
    this.userMenuOpen.set(false);
  }

  toggleNotif(event: Event): void {
    event.stopPropagation();
    this.notifOpen.set(!this.notifOpen());
    this.cartOpen.set(false);
    this.userMenuOpen.set(false);
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.userMenuOpen.set(!this.userMenuOpen());
    this.cartOpen.set(false);
    this.notifOpen.set(false);
  }

  toggleMobileNav(): void {
    this.mobileNavOpen.set(!this.mobileNavOpen());
  }

  isActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }

  markAllRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notifCount.set(0);
  }

  getUserInitials(): string {
    return (this.userConnected?.username || this.userConnected?.email || '').slice(0, 2).toUpperCase();
  }

  logout(): void {
    this.router.navigate(['/login']);
  }

  // ════════════════════════════════════════════════════
  // HOST LISTENERS
  // ════════════════════════════════════════════════════

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 10);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobile();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.nav-profile') && !target.closest('.user-panel') && !target.closest('.nav-action-btn')) {
      this.userMenuOpen.set(false);
    }
    if (!target.closest('.secondary-btn') && !target.closest('.mobile-dropdown-container') && !target.closest('.action-wrapper')) {
      this.cartOpen.set(false);
      this.notifOpen.set(false);
    }
    if (!target.closest('.floating-menu-btn') && !target.closest('.mobile-nav')) {
      this.mobileNavOpen.set(false);
    }
  }

  private checkMobile(): void {
    this.isMobile.set(window.innerWidth <= 900);
    if (!this.isMobile()) this.mobileNavOpen.set(false);
  }
}
