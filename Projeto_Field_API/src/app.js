import express from 'express';
import TarefaController from './app/controllers/TarefaController.js';

const app = express();

// Middleware para permitir CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200'); // Permitir solicitações do frontend Angular
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Métodos HTTP permitidos
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Cabeçalhos permitidos
  next();
});

// Middleware para ler body com JSON
app.use(express.json());

// Rotas
app.get('/tarefas', TarefaController.index);
app.get('/tarefas/:estado', TarefaController.show);
app.post('/tarefas', TarefaController.store);
app.put('/tarefas/:id', TarefaController.update);
app.delete('/tarefas/:id', TarefaController.delete);

export default app;
