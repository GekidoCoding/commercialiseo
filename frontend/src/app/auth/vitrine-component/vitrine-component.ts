import { Component } from '@angular/core';
import { RegisterComponent } from '../register-component/register-component';
import {NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {LoginComponent} from '../login-component/login-component';
import {VerificationEmailComponent} from '../verification-email-component/verification-email-component';

@Component({
  selector: 'app-vitrine-component',
  templateUrl: './vitrine-component.html',
  styleUrls: ['./vitrine-component.css'],
  standalone: false
})
export class VitrineComponent {

  constructor(private modalService: NgbModal) {}

  openSubscribe() {
    this.modalService.open(RegisterComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'xl'  // ou 'lg'
    });
  }
  openConnexion() {
    this.modalService.open(LoginComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'xl'  // ou 'lg'
    });
  }





}
