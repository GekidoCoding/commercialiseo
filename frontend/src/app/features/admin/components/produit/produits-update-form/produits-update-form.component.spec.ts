import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitsUpdateFormComponent } from './produits-update-form.component';

describe('ProduitsUpdateFormComponent', () => {
  let component: ProduitsUpdateFormComponent;
  let fixture: ComponentFixture<ProduitsUpdateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProduitsUpdateFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitsUpdateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
