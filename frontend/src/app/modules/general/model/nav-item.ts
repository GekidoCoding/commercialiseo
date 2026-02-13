export class NavItem {
  displayName: string = '';
  isDropDown: boolean = false;
  link: string = '';
  isActive?: boolean = false;
  iconName?: string = '';
  dropndownElements: NavItem[] | null = null;
}
