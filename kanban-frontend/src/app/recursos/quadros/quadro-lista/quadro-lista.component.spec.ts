import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuadroListaComponent } from './quadro-lista.component';

describe('QuadroListaComponent', () => {
  let component: QuadroListaComponent;
  let fixture: ComponentFixture<QuadroListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuadroListaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuadroListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
