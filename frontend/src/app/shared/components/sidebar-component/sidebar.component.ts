import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {NavigationService} from '../../services/navigation.service';
import {SidebarElement} from '../../model/sidebar-element.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  private navService = inject(NavigationService);
  menu:SidebarElement[] = [];

  ngOnInit() {
    const role = localStorage.getItem('authUser')!;
    this.menu = this.navService.getMenuByRoleAndModule(role);
  }
}
