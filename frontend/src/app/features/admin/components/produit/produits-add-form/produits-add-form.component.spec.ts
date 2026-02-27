import { ComponentFixture, TestBed } from '@angular/core/testing';
import {ProduitsAddFormComponent} from './produits-add-form.component';


describe('ProduitsAddFormComponent', () => {
  let component: ProduitsAddFormComponent;
  let fixture: ComponentFixture<ProduitsAddFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitsAddFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitsAddFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
