
  Projeto Kanban
 Este projeto é um Kanban básico feito com:
- Frontend: Angular
- Backend: NestJS
O objetivo foi implementar um fluxo simples de colunas e cards, seguindo boas práticas de cada framework.

  O que foi feito
- Estrutura básica de colunas no Kanban  
- Comunicação entre frontend e backend via HTTP  
- Uso de FormsModule para formulários e *ngFor para listar colunas  
- Estilização simples com CSS

 Experiência:
Durante o desenvolvimento enfrentei alguns desafios:
- Diferença entre standalone components e o modelo clássico com AppModule no Angular  
- Ajustes de imports para o Angular reconhecer os componentes e selectors  
- Integração entre Angular e NestJS

Mesmo não estando 100% completo, foi uma conquista importante porque me deu experiência prática em projetos reais e estruturados.

 Como rodar:
Backend (NestJS)
cd kanban-backend
npm install
npm run start:dev

O servidor vai rodar em:  
http://localhost:3000

Frontend (Angular)
cd kanban-frontend
npm install
ng serve

O cliente vai rodar em:  
http://localhost:4200