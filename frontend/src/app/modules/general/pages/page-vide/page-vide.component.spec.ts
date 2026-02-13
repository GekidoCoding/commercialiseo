import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageVideComponent } from './page-vide.component';

describe('PageVideComponent', () => {
  let component: PageVideComponent;
  let fixture: ComponentFixture<PageVideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageVideComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageVideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
