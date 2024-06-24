import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertModalProjectComponent } from './insert-modal-project.component';

describe('InsertModalProjectComponent', () => {
  let component: InsertModalProjectComponent;
  let fixture: ComponentFixture<InsertModalProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertModalProjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsertModalProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
