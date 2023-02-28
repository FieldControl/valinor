import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkinListComponent } from './skin-list.component';

describe('SkinListComponent', () => {
  let component: SkinListComponent;
  let fixture: ComponentFixture<SkinListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkinListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkinListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
