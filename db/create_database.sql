create database if not exists valinor_db;
use valinor_db;

create user if not exists 'valinor_user'@'localhost' IDENTIFIED BY 'valinor_pass';
GRANT DELETE, INSERT, SELECT, UPDATE ON valinor_db.* TO 'valinor_user'@'localhost';
flush privileges;

create table if not exists automovel
(
  id     int primary key auto_increment,
  placa  char(8) not null,
  ano    year,
  cor    varchar(20),
  marca  varchar(30),
  modelo varchar(60)
);

insert automovel
set placa  = 'UJH-6549',
    ano    = 2017,
    cor    ='Branco',
    marca  ='Volvo',
    modelo = 's90';


insert automovel
set placa  = 'UJH-6549',
    ano    = 2006,
    cor    ='prata',
    marca  ='Volkswagen',
    modelo = 'voyage';


insert automovel
set placa  = 'UJH-6549',
    ano    = 2008,
    cor    ='branco',
    marca  ='Mercedes',
    modelo = 'classe c';


insert automovel
set placa  = 'UJH-6549',
    ano    = 2019,
    cor    ='Vermelho',
    marca  ='Mercedes',
    modelo = 'AMG';

insert automovel
set placa  = 'UJH-6549',
    ano    = 2007,
    cor    ='Azul',
    marca  ='BMW',
    modelo = 'X6';