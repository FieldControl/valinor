import { ComponentFixture, TestBed } from '@angular/core/testing';
import { hasUncaughtExceptionCaptureCallback } from 'node:process';
import { beforeEach, describe, it, expect } from 'node:test';


import { EditSwimlaneComponent } from './edit-swimlane.component';

describe('EditSwimlaneComponent', () => {
  let component: EditSwimlaneComponent;
  let fixture: ComponentFixture<EditSwimlaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSwimlaneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditSwimlaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
