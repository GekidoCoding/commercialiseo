import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {SidebarElement} from '../model/sidebar-element.model';
import {SIDEBAR_ITEMS} from '../config/navigation.config';

@Injectable({ providedIn: 'root' })
export class NavigationService {

  constructor(private router: Router) {}

  getMenuByRoleAndModule(role: string): SidebarElement[] {
    return SIDEBAR_ITEMS.filter(item =>
      item.roles.includes(role)
    );
  }
}
