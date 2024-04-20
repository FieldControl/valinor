import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskComponent } from './task.component';

describe('Componente que é o card de tarefa:', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Criar componente de tarefa', () => {
    expect(component).toBeTruthy();
  });
});
