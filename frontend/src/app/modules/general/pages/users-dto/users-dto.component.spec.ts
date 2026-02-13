import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersDtoComponent } from './users-dto.component';

describe('UsersDtoComponent', () => {
  let component: UsersDtoComponent;
  let fixture: ComponentFixture<UsersDtoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsersDtoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersDtoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
