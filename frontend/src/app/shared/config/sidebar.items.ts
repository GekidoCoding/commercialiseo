import {SidebarElement} from '../model/sidebar-element.model';

export const SIDEBAR_ITEMS: SidebarElement[] = [
  {
    icon: 'fas fa-home',
    name: 'Dashboard',
    url: '/admin/dashboard',
    roles: ['admin'],
  },
  {
    icon: 'fas fa-users',
    name: 'Users',
    url: '/admin/boutiques',
    roles: ['admin'],
  },
  {
    icon: 'fas fa-book',
    name: 'Courses',
    url: '/boutique/produits',
    roles: ['boutique'],
  }
];
