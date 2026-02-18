export interface SidebarElement {
  icon: string;   // ex: 'fas fa-user'
  name: string;   // ex: 'Utilisateurs'
  url: string;    // ex: '/admin/users'
  roles: string[]; // ex: ['ADMIN']
}
