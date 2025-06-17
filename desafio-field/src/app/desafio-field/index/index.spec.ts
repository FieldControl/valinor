import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { Index } from './index';

describe('Index', () => {
  let component: Index;
  let fixture: ComponentFixture<Index>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Index]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Index);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
