import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionAddFormComponent } from './promotion-add-form.component';

describe('PromotionAddFormComponent', () => {
  let component: PromotionAddFormComponent;
  let fixture: ComponentFixture<PromotionAddFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromotionAddFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromotionAddFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
