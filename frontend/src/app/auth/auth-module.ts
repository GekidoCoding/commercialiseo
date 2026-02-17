import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing-module';
import {VitrineComponent} from './pages/vitrine-component/vitrine-component';
import {NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {LoginComponent} from './components/login-component/login-component';
import {VerificationEmailComponent} from './components/verification-email-component/verification-email-component';
import {FormsModule} from '@angular/forms';
import {RegisterComponent} from './components/register-component/register-component';
import {ForgetPassword} from './components/forget-password/forget-password';
import {ChangePassword} from './components/change-password/change-password';


@NgModule({
  declarations: [
    VitrineComponent ,
    RegisterComponent,
    LoginComponent,
    VerificationEmailComponent,
    ForgetPassword,
    ChangePassword
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    NgbModalModule,
    FormsModule
  ],
  exports: [RegisterComponent]
})
export class AuthModule { }
