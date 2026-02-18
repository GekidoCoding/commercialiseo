import { Component, inject, OnInit, HostListener } from '@angular/core';
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

  private navService = inject(NavigationService);
  private authUtilService = inject(AuthUtilService);
  private router = inject(Router);

  userConnected: User = new User();
  menu: SidebarElement[] = [];
  openDropdowns: Set<string> = new Set();

  /** true = sidebar ouvert (texte visible) ; false = replié (icônes only) */
  isExpanded = true;
  isMobile = false;
  /** En mobile, sidebar fermé par défaut */
  mobileOpen = false;

  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
  }

  ngOnInit() {
    this.loadMenu();
    this.checkMobile();
  }

  private checkMobile() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.mobileOpen = false; // reset
    }
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
      if (!this.isExpanded) {
        this.openDropdowns.clear();
      }
    }
  }

  toggleDropdown(itemName: string): void {
    if (!this.isExpanded && !this.isMobile) return;
    if (this.openDropdowns.has(itemName)) {
      this.openDropdowns.delete(itemName);
    } else {
      this.openDropdowns.add(itemName);
    }
  }

  isOpen(itemName: string): boolean {
    return this.openDropdowns.has(itemName);
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
}
