CREATE DATABASE Library

USE Library

create table Games
(
	Id	int	primary key identity not null,
	Name varchar(50)	not null,
	Release date	not null,
	Category	varchar(30),
	Score	int	not null
)

insert into Games Values('The Legend of Zelda Ocarina of Time', '1998-11-23', 'Action Adventure', 99)

select * from Games

