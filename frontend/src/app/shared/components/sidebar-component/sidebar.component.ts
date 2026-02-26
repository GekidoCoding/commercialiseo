import { Component, inject, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';
import { SidebarElement } from '../../model/sidebar-element.model';
import { User } from '../../../features/auth/models/User';
import { AuthUtilService } from '../../services/auth-util.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  private navService      = inject(NavigationService);
  private authUtilService = inject(AuthUtilService);
  private router          = inject(Router);
  private elementRef      = inject(ElementRef);

  userConnected: User        = new User();
  menu: SidebarElement[]     = [];
  openDropdowns: Set<string> = new Set();

  // ── État Desktop (hover) ──────────────────────
  isExpanded = false;

  // ── État Mobile (drawer) ──────────────────────
  isMobile   = false;
  mobileOpen = false;

  // Pour le positionnement des flyouts
  private itemPositions: Map<string, number> = new Map();

  @HostListener('window:resize')
  onResize() { this.checkMobile(); }

  ngOnInit() {
    this.loadMenu();
    this.checkMobile();
  }

  // ─────────────────────────────────────────────
  // Init
  // ─────────────────────────────────────────────

  private checkMobile(): void {
    const wasMobile = this.isMobile;
    this.isMobile   = window.innerWidth <= 768;
    if (!this.isMobile && wasMobile) {
      this.mobileOpen = false;
    }
  }

  private loadMenu(): void {
    const user = this.authUtilService.getUserFromStorage();
    if (user) {
      this.userConnected = user;
      this.menu          = this.navService.getMenuByRoleAndModule(user.role);
    } else {
      this.userConnected = new User();
      this.menu          = [];
    }
  }

  // ─────────────────────────────────────────────
  // Toggle MOBILE drawer — bouton hamburger uniquement
  // ─────────────────────────────────────────────
  toggleMobileDrawer(): void {
    if (this.isMobile) {
      this.mobileOpen = !this.mobileOpen;
    }
  }

  closeMobileDrawer(): void {
    this.mobileOpen = false;
  }

  // ─────────────────────────────────────────────
  // Hover DESKTOP — expand / collapse
  // ─────────────────────────────────────────────
  onSidebarMouseEnter(): void {
    if (!this.isMobile) {
      this.isExpanded = true;
    }
  }

  onSidebarMouseLeave(): void {
    if (!this.isMobile) {
      this.isExpanded = false;
      this.openDropdowns.clear();
    }
  }

  // ─────────────────────────────────────────────
  // Toggle DROPDOWN enfants — indépendant du sidebar
  // ─────────────────────────────────────────────
  toggleDropdown(itemName: string): void {
    if (this.openDropdowns.has(itemName)) {
      this.openDropdowns.delete(itemName);
    } else {
      // Mode collapsed desktop : un seul flyout à la fois
      if (!this.isExpanded && !this.isMobile) {
        this.openDropdowns.clear();
      }
      this.openDropdowns.add(itemName);
      this.calculateFlyoutPosition(itemName);
    }
  }

  isOpen(itemName: string): boolean {
    return this.openDropdowns.has(itemName);
  }

  // ─────────────────────────────────────────────
  // Flyout desktop collapsed
  // ─────────────────────────────────────────────
  get activeFlyout(): string | null {
    if (this.isExpanded || this.isMobile) return null;
    for (const name of this.openDropdowns) return name;
    return null;
  }

  getFlyoutPosition(itemName: string): number {
    return this.itemPositions.get(itemName) ?? 70;
  }

  private calculateFlyoutPosition(itemName: string): void {
    const index = this.menu.findIndex(item => item.name === itemName);
    if (index !== -1) {
      const headerHeight = 70;
      const itemHeight   = 48;
      const padding      = 12;
      this.itemPositions.set(itemName, headerHeight + padding + index * itemHeight);
    }
  }

  closeFlyout(): void {
    if (!this.isExpanded && !this.isMobile) {
      this.openDropdowns.clear();
    }
  }

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
  get sidebarVisible(): boolean {
    return this.isMobile ? this.mobileOpen : true;
  }

  logout(): void {
    this.authUtilService.logout();
    this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    const name = this.userConnected?.username || this.userConnected?.email || '';
    return name.slice(0, 2).toUpperCase();
  }

  // Fermer le flyout si clic en dehors (desktop collapsed)
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isExpanded && !this.isMobile && this.openDropdowns.size > 0) {
      const clickedInside = this.elementRef.nativeElement.contains(event.target);
      if (!clickedInside) this.openDropdowns.clear();
    }
  }
}
