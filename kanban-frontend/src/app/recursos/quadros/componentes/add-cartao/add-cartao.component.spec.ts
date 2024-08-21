import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdicionarCartaoComponent } from './add-cartao.component';

describe('AdicionarCartaoComponent', () => {
  let component: AdicionarCartaoComponent;
  let fixture: ComponentFixture<AdicionarCartaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdicionarCartaoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdicionarCartaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
