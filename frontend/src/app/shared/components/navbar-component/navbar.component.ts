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
import {AcheteurService} from '../../../features/acheteur/services/acheteur.service';
import {ToastService} from '../../services/toast.service';
import {NotificationService} from '../../services/notification.service';
import {PushNotification} from '../../model/push-notification';

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
  notifications: PushNotification[] = [];
  notificationsLoading = false;

  userConnected: User |null = null;

  // ════════════════════════════════════════════════════
  // LIFECYCLE
  // ════════════════════════════════════════════════════
  constructor(private cartEventService: CartEventService,
              private authService: AuthUtilService,
              private acheteurService: AcheteurService,
              private toastService: ToastService,
              private notificationService: NotificationService
              ) {}
  ngOnInit(): void {
    this.userConnected= this.authService.getUserFromStorage();
    this.checkMobile();
    this.loadCartFromStorage();
    this.cartEventService.cartUpdated
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadCartFromStorage());

    // Charger les notifications UNE SEULE FOIS au démarrage
    if (this.userConnected && this.userConnected.id) {
      this.loadNotifications();
    }

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

  /** Charge les notifications depuis l'API */
  loadNotifications(): void {
    if (!this.userConnected || !this.userConnected.id) {
      this.notifications = [];
      this.notifCount.set(0);
      return;
    }

    this.notificationsLoading = true;
    this.notificationService.getUserNotifications().subscribe({
      next: (response) => {
        this.notificationsLoading = false;
        if (response.success && response.data) {
          this.notifications = response.data;
          this.updateNotifCount();
        } else {
          this.notifications = [];
          this.notifCount.set(0);
        }
      },
      error: (error) => {
        this.notificationsLoading = false;
        console.error('Erreur chargement notifications:', error);
        this.notifications = [];
        this.notifCount.set(0);
      }
    });
  }

  /** Met à jour le compteur de notifications non lues */
  updateNotifCount(): void {
    const unreadCount = this.notificationService.getUnreadCount(this.notifications);
    this.notifCount.set(unreadCount);
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

    // Vérifier que l'utilisateur est connecté
    if (!this.userConnected || !this.userConnected.id) {
      this.passwordError = 'Vous devez être connecté pour effectuer un achat.';
      return;
    }

    // Vérifier que le panier n'est pas vide
    if (this.cartItems.length === 0) {
      this.passwordError = 'Votre panier est vide.';
      return;
    }

    this.isSubmittingOrder = true;
    this.passwordError = '';

    // Préparer les données pour l'API
    const variants = this.cartItems.map(item => ({
      variantId: item.variant._id,
      quantity: item.quantity
    }));

    // Appel au service de confirmation d'achat
    this.acheteurService.confirmPurchase(
      this.userConnected.id,
      this.confirmPassword,
      variants as { variantId: string; quantity: number }[]
    ).subscribe({
      next: (response) => {
        this.isSubmittingOrder = false;

        if (response.success) {
          // Succès : afficher le message et vider le panier
          this.toastService.success(response.message || 'Achat effectué avec succès !');
          this.closeOrderModal();
          this.cartItems = [];
          this.saveCart();
          
          // Rafraîchir les notifications APRÈS l'achat (acheteur seulement)
          if (this.userConnected?.role === 'acheteur') {
            setTimeout(() => {
              this.loadNotifications();
            }, 500);
          }
        } else {
          // Le backend a renvoyé success: false
          this.passwordError = response.message || 'Une erreur est survenue lors de l\'achat.';
        }
      },
      error: (err) => {
        this.isSubmittingOrder = false;
        // Afficher l'erreur venant du backend (ApiError)
        this.passwordError = err.message || 'Erreur lors de la confirmation de l\'achat.';

        // Gestion spécifique des erreurs courantes
        if (err.message?.includes('Mot de passe incorrect')) {
          this.passwordError = 'Mot de passe incorrect. Veuillez réessayer.';
        } else if (err.message?.includes('Stock insuffisant')) {
          this.passwordError = err.message;
        } else if (err.message?.includes('non trouvé')) {
          this.passwordError = err.message;
        }
      }
    });
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
    if (this.notifications.length === 0) return;

    this.notificationService.markAllAsRead(this.notifications).then(() => {
      this.toastService.success('Toutes les notifications ont été marquées comme lues');
      this.loadNotifications(); // Recharger pour afficher l'état à jour
    }).catch((error) => {
      console.error('Erreur lors du marquage des notifications:', error);
      this.toastService.error('Erreur lors du marquage des notifications');
    });
  }

  /** Marque une notification individuelle comme lue */
  markNotificationAsRead(notification: PushNotification): void {
    if (notification.isRead || !notification._id) return;

    this.notificationService.markAsRead(notification._id).subscribe({
      next: (response) => {
        if (response.success) {
          notification.isRead = true;
          this.updateNotifCount();
        }
      },
      error: (error) => {
        console.error('Erreur lors du marquage de la notification:', error);
      }
    });
  }

  /** Retourne l'icône selon la catégorie de notification */
  getCategoryIcon(category?: string): string {
    if (!category) return '🔔';
    
    const icons: { [key: string]: string } = {
      'PURCHASE': '🛒',
      'PAYMENT': '💳',
      'SHIPPING': '📦',
      'PROMOTION': '🎉',
      'MESSAGE': '💬',
      'STOCK': '⚠️',
      'ORDER': '📋'
    };
    
    return icons[category] || '🔔';
  }

  /** Formate le temps écoulé depuis la création */
  formatNotificationTime(dateString?: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "À l'instant";
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return date.toLocaleDateString('fr-FR');
  }

  getUserInitials(): string {
    return (this.userConnected?.username || this.userConnected?.email || '').slice(0, 2).toUpperCase();
  }

  logout(): void {
    const confirmed = confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
    if (confirmed) {
      this.authService.logout();
    }
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
