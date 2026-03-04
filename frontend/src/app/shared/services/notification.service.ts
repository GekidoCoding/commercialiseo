import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { PublicService } from './public.service';
import { PushNotification } from '../model/push-notification';
import { ApiResponse } from '../model/api-response';
import { AuthUtilService } from './auth-util.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  // Subject pour notifier les changements de notifications
  private notificationsUpdated = new BehaviorSubject<void>(undefined);
  public notificationsUpdated$ = this.notificationsUpdated.asObservable();

  constructor(
    private publicService: PublicService,
    private authService: AuthUtilService
  ) {}

  /**
   * Récupère les notifications de l'utilisateur connecté
   */
  getUserNotifications(): Observable<ApiResponse<PushNotification[]>> {
    const user = this.authService.getUserFromStorage();
    if (!user || !user.id) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }

    return this.publicService.findNotificationsByUserId(user.id).pipe(
      tap(() => this.notificationsUpdated.next()),
      catchError(this.handleError)
    );
  }

  /**
   * Marque une notification comme lue
   */
  markAsRead(notificationId: string): Observable<ApiResponse<PushNotification>> {
    return this.publicService.markNotificationAsRead(notificationId).pipe(
      tap(() => this.notificationsUpdated.next()),
      catchError(this.handleError)
    );
  }

  /**
   * Marque toutes les notifications comme lues
   */
  markAllAsRead(notifications: PushNotification[]): Promise<void> {
    const unreadNotifications = notifications.filter(n => !n.isRead && n._id);
    
    if (unreadNotifications.length === 0) {
      return Promise.resolve();
    }

    // Marquer chaque notification comme lue
    const promises = unreadNotifications.map(notif => 
      this.markAsRead(notif!._id!).toPromise()
    );

    return Promise.all(promises).then(() => {
      this.notificationsUpdated.next();
    });
  }

  /**
   * Compter le nombre de notifications non lues
   */
  getUnreadCount(notifications: PushNotification[]): number {
    return notifications.filter(n => !n.isRead).length;
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Une erreur inconnue est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = error.error?.message || `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('Notification Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
