import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostItComponent } from './post-it.component';

describe('PostItComponent', () => {
  let component: PostItComponent;
  let fixture: ComponentFixture<PostItComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostItComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PostItComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
