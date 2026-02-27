import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ToastService {

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Affiche un message de succès
   */
  success(message: string, duration: number = 5000) {
    this.snackBar.open(message, 'OK', {
      duration: duration,
      panelClass: ['success-snackbar'],
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }

  /**
   * Affiche un message d'erreur
   */
  error(message: string, duration: number = 5000) {
    this.snackBar.open(message, 'OK', {
      duration: duration,
      panelClass: ['error-snackbar'],
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }

  /**
   * Affiche un message d'avertissement
   */
  warning(message: string, duration: number = 5000) {
    this.snackBar.open(message, 'OK', {
      duration: duration,
      panelClass: ['warning-snackbar'],
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }

  /**
   * Affiche un message d'information
   */
  info(message: string, duration: number = 5000) {
    this.snackBar.open(message, 'OK', {
      duration: duration,
      panelClass: ['info-snackbar'],
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }
}
