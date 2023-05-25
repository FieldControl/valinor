import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuBuscaComponent } from './menu-busca.component';

describe('MenuBuscaComponent', () => {
  let component: MenuBuscaComponent;
  let fixture: ComponentFixture<MenuBuscaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuBuscaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuBuscaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
