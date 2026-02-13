import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralRoutingModule } from './general-routing.module';
import { GeneralComponent } from './general.component';
import { DocumentationComponent } from './pages/documentation/documentation.component';
import { PageVideComponent } from './pages/page-vide/page-vide.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { PageTestComponent } from './pages/page-test/page-test.component';
import {FormsModule} from "@angular/forms";
import {CrudTestComponent} from "./pages/crud-test/crud-test.component";
import { UsersDtoComponent } from './pages/users-dto/users-dto.component';
import {NgxSpinnerModule} from "ngx-spinner";


@NgModule({
  declarations: [
    GeneralComponent,
    DocumentationComponent,
    PageVideComponent,
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    PageTestComponent,
    CrudTestComponent,
    UsersDtoComponent

  ],
  imports: [CommonModule, GeneralRoutingModule, FormsModule, NgxSpinnerModule],
  exports: [FooterComponent, NavbarComponent, SidebarComponent],
})
export class GeneralModule {}
