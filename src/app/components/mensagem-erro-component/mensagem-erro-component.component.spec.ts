import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensagemErroComponentComponent } from './mensagem-erro-component.component';

describe('MensagemErroComponentComponent', () => {
  let component: MensagemErroComponentComponent;
  let fixture: ComponentFixture<MensagemErroComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MensagemErroComponentComponent]
    });
    fixture = TestBed.createComponent(MensagemErroComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
