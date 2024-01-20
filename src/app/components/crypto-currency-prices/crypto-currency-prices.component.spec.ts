import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptoCurrencyPricesComponent } from './crypto-currency-prices.component';

describe('CryptoCurrencyPricesComponent', () => {
  let component: CryptoCurrencyPricesComponent;
  let fixture: ComponentFixture<CryptoCurrencyPricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CryptoCurrencyPricesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CryptoCurrencyPricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
