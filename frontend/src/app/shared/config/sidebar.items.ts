import {SidebarElement} from '../model/sidebar-element.model';

export const SIDEBAR_ITEMS: SidebarElement[] = [
  {
    icon: 'fas fa-home',
    name: 'Dashboard',
    url: '/admin/dashboard',
    roles: ['admin'],
  },
  {
    icon: 'fas fa-users-cog',
    name: 'Gestion Utilisateurs',
    url: '',
    roles: ['admin'],
    children: [
      {
        icon: 'fas fa-user-shield',
        name: 'Administrateurs',
        url: '/admin/users/admins',
        roles: ['admin'],
      },
      {
        icon: 'fas fa-store',
        name: 'Boutiques',
        url: '/admin/users/boutiques',
        roles: ['admin'],
      },
      {
        icon: 'fas fa-shopping-bag',
        name: 'Acheteurs',
        url: '/admin/users/acheteurs',
        roles: ['admin'],
      }
    ]
  },
  {
    icon: 'fas fa-box',
    name: 'Produits',
    url: '',
    roles: ['admin'],
    children: [
      {
        icon: 'fas fa-list',
        name: 'Liste des produits',
        url: '/admin/produits',
        roles: ['admin'],
      },
      {
        icon: 'fas fa-plus',
        name: 'Ajouter un produit',
        url: '/admin/produits/ajouter',
        roles: ['admin'],
      },
      {
        icon: 'fas fa-tags',
        name: 'Catégories',
        url: '/admin/categories',
        roles: ['admin'],
      }
    ]
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
        url: '/boutique/produits',
        roles: ['boutique'],
      },
      {
        icon: 'fas fa-plus-circle',
        name: 'Ajouter Produit',
        url: '/boutique/produits/ajouter',
        roles: ['boutique'],
      },
      {
        icon: 'fas fa-chart-line',
        name: 'Statistiques',
        url: '/boutique/statistiques',
        roles: ['boutique'],
      }
    ]
  },
  {
    icon: 'fas fa-shopping-cart',
    name: 'Mes Achats',
    url: '/acheteur/achats',
    roles: ['acheteur'],
  },
  {
    icon: 'fas fa-heart',
    name: 'Favoris',
    url: '/acheteur/favoris',
    roles: ['acheteur'],
  },
  {
    icon: 'fas fa-cog',
    name: 'Paramètres',
    url: '/parametres',
    roles: ['admin', 'boutique', 'acheteur'],
  }

];
