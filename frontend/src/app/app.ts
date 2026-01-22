import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Apollo, gql } from 'apollo-angular';
import { FormsModule } from '@angular/forms';

const LOGIN_MUTATION = gql`
  mutation($email: String!, $password: String!) {
    login(loginInput: { email: $email, password: $password }) {
      access_token
      user { name }
    }
  }
`;

// --- NOVA MUTATION DE CADASTRO ---
const CREATE_USER_MUTATION = gql`
  mutation($name: String!, $email: String!, $password: String!) {
    createUser(createUserInput: { name: $name, email: $email, password: $password }) {
      id name email
    }
  }
`;

const GET_TAKS = gql`
  query {
    tasks {
      id, title, description, dueDate, order
      column { id name }
    }
    boards {
      id, columns { id name }
    }
  }
`;

const CREATE_TASK = gql`
  mutation($input: CreateTaskInput!) {
    createTask(input: $input) { id title }
  }
`;

const MOVE_TASK = gql`
  mutation($input: MoveTaskInput!) {
    moveTask(input: $input) { id }
  }
`;

const DELETE_TASK = gql`
  mutation($id: String!) {
    deleteTask(id: $id)
  }
`;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  
  // Controle da tela de Login/Cadastro
  isRegistering = false; 
  loginData = { email: '', password: '' };
  registerData = { name: '', email: '', password: '' };
  erroLogin = '';

  todo: any[] = [];
  doing: any[] = [];
  done: any[] = [];
  colunasIds: any = {}; 
  selecionado: any = null;
  novoTitulo = '';
  novaDescricao = '';
  novoPrazo = '';
  totalTasks = 0;
  progress = 0;
  atrasadas = 0;

  constructor(
    private apollo: Apollo, 
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone 
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedIn = true;
      this.carregarDados();
    }
    this.novoPrazo = new Date().toISOString().split('T')[0];
  }

  // --- ALTERNA ENTRE LOGIN E CADASTRO ---
  toggleRegister() {
    this.isRegistering = !this.isRegistering;
    this.erroLogin = ''; // Limpa msg de erro
  }

  // --- FAZER LOGIN ---
  fazerLogin() {
    this.apollo.mutate({
      mutation: LOGIN_MUTATION,
      variables: {
        email: this.loginData.email,
        password: this.loginData.password
      }
    }).subscribe({
      next: (result: any) => {
        localStorage.setItem('token', result.data.login.access_token);
        this.isLoggedIn = true;
        this.erroLogin = '';
        this.carregarDados();
      },
      error: (err) => {
        this.erroLogin = 'Email ou senha incorretos!';
      }
    });
  }

  // --- FAZER CADASTRO (NOVO) ---
  fazerCadastro() {
    if (!this.registerData.name || !this.registerData.email || !this.registerData.password) {
        this.erroLogin = 'Preencha todos os campos!';
        return;
    }

    this.apollo.mutate({
        mutation: CREATE_USER_MUTATION,
        variables: {
            name: this.registerData.name,
            email: this.registerData.email,
            password: this.registerData.password
        }
    }).subscribe({
        next: (res) => {
            alert('Conta criada com sucesso! Agora faça login.');
            this.toggleRegister(); // Volta pra tela de login
            // Preenche o email pra facilitar pro usuário
            this.loginData.email = this.registerData.email; 
            this.registerData = { name: '', email: '', password: '' };
        },
        error: (err) => {
            console.error(err);
            this.erroLogin = 'Erro ao criar conta. Email já existe?';
        }
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.todo = []; this.doing = []; this.done = [];
  }

  // --- RESTO DO CÓDIGO (KANBAN) ---
  carregarDados() {
    this.apollo
      .watchQuery({ query: GET_TAKS, fetchPolicy: 'network-only' })
      .valueChanges.subscribe((result: any) => {
        this.ngZone.run(() => {
            const tasksRaw = result.data?.tasks || [];
            const boards = result.data?.boards || [];

            if (boards.length > 0 && boards[0].columns) {
                boards[0].columns.forEach((col: any) => {
                    const nome = col.name.toLowerCase();
                    if (nome.includes('fazer') || nome.includes('todo')) this.colunasIds['TODO'] = col.id;
                    else if (nome.includes('progresso') || nome.includes('doing')) this.colunasIds['DOING'] = col.id;
                    else if (nome.includes('feito') || nome.includes('done')) this.colunasIds['DONE'] = col.id;
                    this.colunasIds[col.name] = col.id;
                });
            }

            const todoTemp: any[] = [];
            const doingTemp: any[] = [];
            const doneTemp: any[] = [];

            tasksRaw.forEach((t: any) => {
              const colId = t.column?.id;
              if (colId === this.colunasIds['TODO']) todoTemp.push(t);
              else if (colId === this.colunasIds['DOING']) doingTemp.push(t);
              else if (colId === this.colunasIds['DONE']) doneTemp.push(t);
            });

            this.todo = [...todoTemp];
            this.doing = [...doingTemp];
            this.done = [...doneTemp];
            this.atualizarEstatisticas();
            this.cdr.detectChanges(); 
        });
      });
  }

  atualizarEstatisticas() {
    this.totalTasks = this.todo.length + this.doing.length + this.done.length;
    if (this.totalTasks > 0) {
      this.progress = Math.round((this.done.length / this.totalTasks) * 100);
    } else {
      this.progress = 0;
    }
    const hoje = new Date().toISOString().split('T')[0];
    const pendentes = [...this.todo, ...this.doing]; 
    this.atrasadas = pendentes.filter(t => {
      if (!t.dueDate) return false;
      const dataTarefa = t.dueDate.split('T')[0];
      return dataTarefa < hoje;
    }).length;
  }

  adicionar() {
    if (!this.novoTitulo.trim()) return;
    let idColuna = this.colunasIds['TODO']; 
    if (!idColuna && Object.values(this.colunasIds).length > 0) idColuna = Object.values(this.colunasIds)[0];
    const input = {
      title: this.novoTitulo,
      description: this.novaDescricao,
      dueDate: this.novoPrazo || null,
      order: 0,
      columnId: idColuna
    };
    this.apollo.mutate({
        mutation: CREATE_TASK,
        variables: { input },
        refetchQueries: [{ query: GET_TAKS }],
      }).subscribe(() => {
        this.novoTitulo = ''; this.novaDescricao = '';
      });
  }

  remover(id: string) {
    if (confirm('Deletar tarefa?')) {
        this.apollo.mutate({
            mutation: DELETE_TASK,
            variables: { id },
            refetchQueries: [{ query: GET_TAKS }]
        }).subscribe();
        this.selecionado = null;
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      const task = event.container.data[event.currentIndex];
      let novaColunaId = '';
      if (event.container.id === 'lista-todo') novaColunaId = this.colunasIds['TODO'];
      if (event.container.id === 'lista-doing') novaColunaId = this.colunasIds['DOING'];
      if (event.container.id === 'lista-done') novaColunaId = this.colunasIds['DONE'];

      if (novaColunaId) {
        this.apollo.mutate({
            mutation: MOVE_TASK,
            variables: { input: { taskId: task.id, toColumnId: novaColunaId, newOrder: event.currentIndex } }
        }).subscribe();
      }
      this.atualizarEstatisticas();
    }
  }

  abrirDetalhes(task: any) { 
    this.selecionado = { ...task };
    if (this.selecionado.dueDate) {
        this.selecionado.dueDate = this.selecionado.dueDate.split('T')[0];
    }
  }
  
  fecharDetalhes() { this.selecionado = null; }
}