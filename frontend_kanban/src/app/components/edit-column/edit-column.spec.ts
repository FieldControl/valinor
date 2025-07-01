import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditColumn } from './edit-column';

describe('EditColumn', () => {
  let component: EditColumn;
  let fixture: ComponentFixture<EditColumn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditColumn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditColumn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
