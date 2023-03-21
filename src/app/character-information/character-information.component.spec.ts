import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterInformationComponent } from './character-information.component';

describe('CharacterInformationComponent', () => {
  let component: CharacterInformationComponent;
  let fixture: ComponentFixture<CharacterInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CharacterInformationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
