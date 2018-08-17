-- Generation time: Tue, 07 Aug 2018 23:48:58 +0000

CREATE DATABASE `resourse_db_teste`  

DROP TABLE IF EXISTS `resources`;
CREATE TABLE `resources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `data` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `resources` VALUES 
('1','Luiz Freneda','luiz@gmail.com','INICIAL','2018-06-20'),
('2','Eduardo','eduardo@gmail.com','INICIAL','2018-06-20'),
('3','Tadeu','tadeu@gmail.com','INICIAL','2018-06-20'),
('4','Pessoa','pessoa@example.com','INICIAL','2018-06-20');