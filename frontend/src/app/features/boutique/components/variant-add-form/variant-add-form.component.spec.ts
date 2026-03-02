import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantAddFormComponent } from './variant-add-form.component';

describe('VariantAddFormComponent', () => {
  let component: VariantAddFormComponent;
  let fixture: ComponentFixture<VariantAddFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariantAddFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariantAddFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
