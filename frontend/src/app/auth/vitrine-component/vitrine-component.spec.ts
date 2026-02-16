import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VitrineComponent } from './vitrine-component';

describe('VitrineComponent', () => {
  let component: VitrineComponent;
  let fixture: ComponentFixture<VitrineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VitrineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VitrineComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
