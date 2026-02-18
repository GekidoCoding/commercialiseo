import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NavbarComponent} from '../navbar-component/navbar.component';
import {SidebarComponent} from '../sidebar-component/sidebar.component';

@Component({
  selector: 'app-module-layout',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, RouterOutlet],
  templateUrl: './module-layout.component.html',
  styleUrls: ['./module-layout.component.css']
})
export class ModuleLayoutComponent {}
