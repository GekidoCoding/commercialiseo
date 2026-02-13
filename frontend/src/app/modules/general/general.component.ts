import { Component, OnInit } from '@angular/core';
import { NavItem } from './model/nav-item';
import { StateService } from './services/state.service';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
})
export class GeneralComponent implements OnInit {
  constructor(private state: StateService) {}

  ngOnInit(): void {
    //exemple de menu supplémentaires
    // this.state.setValue(this.itemsTresoCisse);
  }

  itemsTresoCisse: NavItem[] = [
    {
      displayName: 'Décaissement',
      isDropDown: false,
      link: '/treso/caisse/decaissement',
      iconName: 'fas fa-coins',
      dropndownElements: null,
    },
    {
      displayName: '',
      isDropDown: true,
      iconName: 'fas fa-balance-scale',
      link: '/treso/caisse/versement',
      dropndownElements: [
        {
          displayName: 'Décaissement',
          isDropDown: false,
          link: '/treso/caisse/decaissement',
          dropndownElements: null,
        },
      ],
    },
  ];
}
