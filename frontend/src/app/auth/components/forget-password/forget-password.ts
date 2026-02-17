import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '../../services/auth-service';
import {LoginComponent} from '../login-component/login-component';
import {VerificationEmailComponent} from '../verification-email-component/verification-email-component';
import {User} from '../../models/User';
import {ChangePassword} from '../change-password/change-password';


@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.html',
  styleUrls: ['./forget-password.css'],
  standalone: false,
})
export class ForgetPassword implements OnInit {
  user: User = new User();

  isSubmitting: boolean = false;
  errorMessage: string = '';
  showError: boolean = false;

  constructor(
    public modalService: NgbModal,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user.role = this.user.roles[0];
  }
  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.user.email);
  }
  isFormValid(): boolean {
    return this.isEmailValid() ;

  }

  onSubmit(event:Event): void {
    // Réinitialiser les erreurs
    event.preventDefault();
    this.isSubmitting = true;
    this.showError = false;
    this.errorMessage = '';

    // Appel au service d'authentification
    this.authService.sendCodePassword(this.user.email,true).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('envoi réussie:', response);

        // Fermer le modal actuel
        this.modalService.dismissAll();
        this.openChangingPassword();
      },
      error: (error) => {

        this.isSubmitting = false;
        this.showError = true;

        // Gestion des différents types d'erreurs
        const errorMsg = error.message || error;

        if (errorMsg || errorMsg!='') {
          this.errorMessage = errorMsg;
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l\'inscription';
        }
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Ouvre le modal de connexion
   */
  openConnexion() {
    this.modalService.dismissAll();
    this.modalService.open(LoginComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'xl'  // ou 'lg'
    });
  }

  openChangingPassword() {
    this.modalService.dismissAll();
    const modal=this.modalService.open(ChangePassword, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'xl'
    });
    modal.componentInstance.email=this.user.email;
  }
}
