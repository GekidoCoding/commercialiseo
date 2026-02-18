import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestAdmin } from './test-admin';

describe('TestAdmin', () => {
  let component: TestAdmin;
  let fixture: ComponentFixture<TestAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
