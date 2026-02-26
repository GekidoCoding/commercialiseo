import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorieFormComponent } from './categorie-form.component';

describe('CategorieFormComponent', () => {
  let component: CategorieFormComponent;
  let fixture: ComponentFixture<CategorieFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorieFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategorieFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
