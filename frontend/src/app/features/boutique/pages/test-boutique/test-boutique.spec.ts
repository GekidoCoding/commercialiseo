import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestBoutique } from './test-boutique';

describe('TestBoutique', () => {
  let component: TestBoutique;
  let fixture: ComponentFixture<TestBoutique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestBoutique]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestBoutique);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
