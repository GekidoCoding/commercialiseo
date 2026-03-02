import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantUpdateFormComponent } from './variant-update-form.component';

describe('VariantUpdateFormComponent', () => {
  let component: VariantUpdateFormComponent;
  let fixture: ComponentFixture<VariantUpdateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariantUpdateFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariantUpdateFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
