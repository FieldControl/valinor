create database resourceDb;
use resourceDb;

CREATE TABLE `resources` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `nome` varchar(255) NOT NULL,
        `email` varchar(255) NOT NULL,
        `status` varchar(255) NOT NULL,
        `data` DATE,
         PRIMARY KEY (id)
);