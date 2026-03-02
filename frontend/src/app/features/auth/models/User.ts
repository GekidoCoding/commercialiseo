export class User {
  id: string='';
  email: string = '';
  username: string = '';
  password: string = '';
  readonly roles: string[] = [ 'acheteur', 'boutique' , 'admin'];
  role: string = this.roles[0];

  setRole(role: string) {
    if (!this.roles.includes(role)) {
      throw new Error(`Role invalide. Choisir parmi : ${this.roles.join(', ')}`);
    }
    this.role = role;
  }
}
