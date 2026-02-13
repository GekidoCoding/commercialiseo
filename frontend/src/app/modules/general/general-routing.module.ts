import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneralComponent } from './general.component';
import { DocumentationComponent } from './pages/documentation/documentation.component';
import { PageVideComponent } from './pages/page-vide/page-vide.component';
import {PageTestComponent} from "./pages/page-test/page-test.component";
import {CrudTestComponent} from "./pages/crud-test/crud-test.component";
import {UsersDtoComponent} from "./pages/users-dto/users-dto.component";

const routes: Routes = [
  {
    path: '',
    component: GeneralComponent,
    children: [
      {
        path: '',
        redirectTo: 'documentation',
        pathMatch: 'full',
      },
      {
        path: 'documentation', // child route path
        component: DocumentationComponent, // child route component that the router renders
      },
      {
        path: 'page-vide', // child route path
        component: PageVideComponent, // child route component that the router renders
      },
      {
        path: 'page-test', // child route path
        component: PageTestComponent, // child route component that the router renders
      },
      {
        path: 'crud-test', // child route path
        component: CrudTestComponent, // child route component that the router renders
      },
      {
        path: 'users-dto', // child route path
        component: UsersDtoComponent, // child route component that the router renders
      },


      { path: '**', redirectTo: 'documentation' },
    ],
  },
  { path: '**', redirectTo: 'documentation' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GeneralRoutingModule {}
