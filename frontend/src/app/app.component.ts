import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { AccountService } from './modules/general/services/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private isLoginSubscription: Subscription | null = null;
  config: any;
  constructor(
    private spinner: NgxSpinnerService,
    private account: AccountService,
    private httpClient: HttpClient
  ) { }
  ngOnInit(): void {
    this.isLoginSubscription = this.account.firstLogin.subscribe((res) => {
      if (res) {
        this.spinner.show('principalSpinner');
      } else {
        this.spinner.hide('principalSpinner');
      }
    });

    this.config = require("./../assets/config.json");
    console.log("Client version: " + this.config?.version);

    const headers = new HttpHeaders()
      .set('Cache-Control', 'no-cache')
      .set('Pragma', 'no-cache');

    this.httpClient
      .get<any>('/assets/config.json', { headers })
      .subscribe((config) => {
        console.log("Server version : " + config.version);
        if (config.version !== this.config?.version) {
          console.log("New version available !");
          this.httpClient
            .get("", { headers, responseType: "text" })
            .subscribe(() => location.reload());
        }
      });
  }
  ngOnDestroy(): void {
    this.isLoginSubscription?.unsubscribe();
  }
}
