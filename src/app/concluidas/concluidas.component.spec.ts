import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcluidasComponent } from './concluidas.component';

describe('ConcluidasComponent', () => {
  let component: ConcluidasComponent;
  let fixture: ComponentFixture<ConcluidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConcluidasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConcluidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
