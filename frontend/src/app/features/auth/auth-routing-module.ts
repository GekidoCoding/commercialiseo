import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {RegisterComponent} from './components/register-component/register-component';
import {LoginComponent} from './components/login-component/login-component';
import {VitrineComponent} from './pages/vitrine-component/vitrine-component';

const routes: Routes = [
  { path: '', component: VitrineComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'vitrine', component: VitrineComponent },

];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
