import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PromotionUpdateFormComponent } from './promotion-update-form.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

describe('PromotionUpdateFormComponent', () => {
  let component: PromotionUpdateFormComponent;
  let fixture: ComponentFixture<PromotionUpdateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PromotionUpdateFormComponent],
      imports: [FormsModule],
      providers: [
        { provide: NgbActiveModal, useValue: { dismiss: () => {}, close: () => {} } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromotionUpdateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
