import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestAcheteur } from './test-acheteur';

describe('TestAcheteur', () => {
  let component: TestAcheteur;
  let fixture: ComponentFixture<TestAcheteur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestAcheteur]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestAcheteur);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
