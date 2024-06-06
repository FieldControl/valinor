import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddQuadroComponent } from './add-quadro.component';

describe('AddQuadroComponent', () => {
  let component: AddQuadroComponent;
  let fixture: ComponentFixture<AddQuadroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddQuadroComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddQuadroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
