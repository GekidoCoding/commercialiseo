import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing-module';
import {VitrineComponent} from './vitrine-component/vitrine-component';
import {RegisterComponent} from './register-component/register-component';
import {NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {LoginComponent} from './login-component/login-component';
import {VerificationEmailComponent} from './verification-email-component/verification-email-component';


@NgModule({
  declarations: [
    VitrineComponent ,
    RegisterComponent,
    LoginComponent,
    VerificationEmailComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    NgbModalModule
  ],
  exports: [RegisterComponent]
})
export class AuthModule { }
