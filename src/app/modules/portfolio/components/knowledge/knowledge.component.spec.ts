import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeComponent } from './knowledge.component';

describe('KnowledgeComponent', () => {
  let component: KnowledgeComponent;
  let fixture: ComponentFixture<KnowledgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnowledgeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KnowledgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
