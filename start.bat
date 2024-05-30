@echo off

rem Inicia o servidor NestJS em uma nova janela do terminal
cd backend
start cmd /k npm start

rem Aguarda alguns segundos para garantir que o servidor NestJS está pronto
timeout /t 5

rem Inicia o servidor Angular em uma nova janela do terminal
cd ../frontend
start cmd /k npm start
