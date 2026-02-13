import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from './modules/general/guard/app.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'general',
    pathMatch: 'full',
  },
  {
    path: 'general',
    // canActivate: [AppGuard],
    loadChildren: () =>
      import('./modules/general/general.module').then((m) => m.GeneralModule),
  },
  {
    path: '**',
    redirectTo: 'general',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
