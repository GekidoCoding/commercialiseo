import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsListBoutiqueComponent } from './products-list-boutique.component';

describe('ProductsListBoutiqueComponent', () => {
  let component: ProductsListBoutiqueComponent;
  let fixture: ComponentFixture<ProductsListBoutiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsListBoutiqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsListBoutiqueComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
