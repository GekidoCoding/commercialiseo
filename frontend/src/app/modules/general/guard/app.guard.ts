import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { User } from '../model/user';
import { AccountService } from '../services/account.service';

@Injectable({
  providedIn: 'root',
})
export class AppGuard implements CanActivate {
  constructor(private router: Router, private account: AccountService) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    let data = sessionStorage.getItem('user');
    if (data != null) {
      //si session present=>poursuivre
      //console.log(route);
      return true;
    } else {
      //session venant de principal
      if (
        route.queryParams.tkn &&
        this.account.decodeUserInfo(route.queryParams.tkn) != null
      ) {
        //get new token from the server because the token that came from principal
        //migth be expired
        //console.log(route, state.url.split('?')[0]);
        this.account.getNewAccessToken(route.queryParams.tkn).subscribe(
          (res: any) => {
            sessionStorage.setItem('user', res.user.token);

            let userInput: User = {
              matricule: this.account.getMatricule(),
            };
            this.account.setFirstLogin(true);
            this.account.getAgentActif(userInput).subscribe(
              (res: any) => {
                // this.account.setFirstLogin(false);
                this.account.setFirstLogin(true);

                this.account.setUser(res[0]);

                let routeTogo = '';
                let routeURL = state.url.split('?')[0].split('/');
                routeURL.splice(0, 1);
                //console.log(routeURL);

                for (let i = 0; i < routeURL.length; i++) {
                  if (i == 0) routeTogo += routeURL[i];
                  else routeTogo += '/' + routeURL[i];
                }
                //console.log(routeTogo);
                this.router.navigate([routeTogo]);

                return true;
              },
              (error) => {
                this.account.logout();
              }
            );
          },
          (error) => {
            this.account.logout();
          }
        );
      } else {
        this.account.logout();
      }
    }
    // return false;
    return true;
  }
}
