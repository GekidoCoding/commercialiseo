import {SidebarElement} from '../model/sidebar-element.model';

export const SIDEBAR_ITEMS: SidebarElement[] = [
  {
    icon: 'fas fa-home',
    name: 'Dashboard',
    url: '/admin',
    roles: ['admin'],
  },

  {
    icon: 'fas fa-store',
    name: 'Ma Boutique',
    url: '',
    roles: ['boutique'],
    children: [
      {
        icon: 'fas fa-box-open',
        name: 'Mes Produits',
        url: '/boutique/products/user',
        roles: ['boutique'],
      },
    ]
  },
  {
    icon: 'fas fa-home',
    name: 'Acceuil',
    url: '/acheteur/products/recommanded',
    roles: ['acheteur'],
  },
  {
    icon: 'fas fa-heart',
    name: 'Favoris',
    url: '/acheteur/favoris',
    roles: ['acheteur'],
  },
  // {
  //   icon: 'fas fa-cog',
  //   name: 'Paramètres',
  //   url: '/parametres',
  //   roles: ['admin', 'boutique', 'acheteur'],
  // }

];
