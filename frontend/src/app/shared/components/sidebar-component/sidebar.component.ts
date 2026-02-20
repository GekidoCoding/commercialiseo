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

  userConnected: User     = new User();
  menu: SidebarElement[]  = [];
  openDropdowns: Set<string> = new Set();

  isExpanded = true;
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

  private checkMobile() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile && wasMobile) this.mobileOpen = false;
  }

  private loadMenu() {
    const user = this.authUtilService.getUserFromStorage();
    if (user) {
      this.userConnected = user;
      this.menu = this.navService.getMenuByRoleAndModule(user.role);
    } else {
      this.userConnected = new User();
      this.menu = [];
    }
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.mobileOpen = !this.mobileOpen;
    } else {
      this.isExpanded = !this.isExpanded;
      // Fermer tous les flyouts quand on toggle la sidebar
      if (this.isExpanded) {
        this.openDropdowns.clear();
      }
    }
  }

  toggleDropdown(itemName: string): void {
    if (this.openDropdowns.has(itemName)) {
      this.openDropdowns.delete(itemName);
    } else {
      // En mode collapsed, on ferme les autres flyouts
      if (!this.isExpanded && !this.isMobile) {
        this.openDropdowns.clear();
      }
      this.openDropdowns.add(itemName);
      // Calculer la position pour le flyout
      this.calculateFlyoutPosition(itemName);
    }
  }

  isOpen(itemName: string): boolean {
    return this.openDropdowns.has(itemName);
  }

  get activeFlyout(): string | null {
    if (this.isExpanded || this.isMobile) return null;
    for (const name of this.openDropdowns) {
      return name;
    }
    return null;
  }

  getFlyoutPosition(itemName: string): number {
    return this.itemPositions.get(itemName) || 70; // Default: header height
  }

  private calculateFlyoutPosition(itemName: string): void {
    // Trouver l'index de l'item dans le menu
    const index = this.menu.findIndex(item => item.name === itemName);
    if (index !== -1) {
      // Header (70px) + padding + items précédents
      const headerHeight = 70;
      const itemHeight = 48; // Hauteur approximative d'un item
      const padding = 12;
      const position = headerHeight + padding + (index * itemHeight);
      this.itemPositions.set(itemName, position);
    }
  }

  closeFlyout(): void {
    if (!this.isExpanded && !this.isMobile) {
      this.openDropdowns.clear();
    }
  }

  get sidebarVisible(): boolean {
    return this.isMobile ? this.mobileOpen : true;
  }

  logout() {
    this.authUtilService.logout();
    this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    const name = this.userConnected?.username || this.userConnected?.email || '';
    return name.slice(0, 2).toUpperCase();
  }

  // Fermer le flyout si on clique ailleurs
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isExpanded && !this.isMobile && this.openDropdowns.size > 0) {
      const clickedInside = this.elementRef.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.openDropdowns.clear();
      }
    }
  }
}
