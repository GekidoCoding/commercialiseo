import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NavItem } from '../model/nav-item';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private navigationTab: BehaviorSubject<[]> = new BehaviorSubject([]);
  get nav(): BehaviorSubject<[]> {
    return this.navigationTab;
  }
  setValue(items: any) {
    this.navigationTab.next(items);
  }
  constructor() {}
}
