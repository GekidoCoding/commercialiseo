import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsListAcheteurComponent } from './products-list-acheteur.component';

describe('ProductsListAcheteurComponent', () => {
  let component: ProductsListAcheteurComponent;
  let fixture: ComponentFixture<ProductsListAcheteurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsListAcheteurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsListAcheteurComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
