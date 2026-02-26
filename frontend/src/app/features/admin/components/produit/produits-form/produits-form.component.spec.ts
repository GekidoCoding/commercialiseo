import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitsFormComponent } from './produits-form.component';

describe('ProduitsFormComponent', () => {
  let component: ProduitsFormComponent;
  let fixture: ComponentFixture<ProduitsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitsFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
