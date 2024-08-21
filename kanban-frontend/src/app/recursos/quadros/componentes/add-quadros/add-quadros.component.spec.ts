import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdicionarQuadroComponent } from './add-quadros.component';

describe('AdicionarQuadroComponent', () => {
  let component: AdicionarQuadroComponent;
  let fixture: ComponentFixture<AdicionarQuadroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdicionarQuadroComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdicionarQuadroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
