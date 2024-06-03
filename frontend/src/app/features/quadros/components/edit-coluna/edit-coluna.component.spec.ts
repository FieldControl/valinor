import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditColunaComponent } from './edit-coluna.component';

describe('EditColunaComponent', () => {
  let component: EditColunaComponent;
  let fixture: ComponentFixture<EditColunaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditColunaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditColunaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
