-- Generation time: Tue, 07 Aug 2018 23:48:58 +0000
-- Host: mysql.hostinger.ro
-- DB name: u574849695_21
/*!40030 SET NAMES UTF8 */;
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP TABLE IF EXISTS `resources`;
CREATE TABLE `resources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `data` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

/*
  REGEX para substituir statatus por inicial:
    Find:       (\('\d*','\w*','(\w|\.|@)*',)('\w*')
    Replace:    $1'INICIAL'
*/

INSERT INTO `resources` VALUES 
('1','Vickie','marisa63@example.net','INICIAL','2016-06-20'),
('2','Rasheed','wmarquardt@example.net','INICIAL','1989-10-29'),
('3','Lewis','jimmy.graham@example.org','INICIAL','2004-12-15'),
('4','Hertha','trent.stiedemann@example.com','INICIAL','2014-07-17'),
('5','Walter','dietrich.bettye@example.org','INICIAL','2010-09-21'),
('6','Maximillian','lora00@example.net','INICIAL','2007-09-13'),
('7','Aliyah','bkozey@example.com','INICIAL','1982-12-27'),
('8','Aryanna','jairo63@example.org','INICIAL','2013-08-11'),
('9','Jack','moshe04@example.net','INICIAL','1992-06-21'),
('10','Wilfred','kassulke.margaret@example.org','INICIAL','1985-05-08'),
('11','Vicenta','arch.langworth@example.com','INICIAL','2000-04-01'),
('12','Julie','wlabadie@example.org','INICIAL','2017-06-06'),
('13','Abbey','kemmer.trycia@example.com','INICIAL','1977-05-06'),
('14','Francisco','marietta49@example.org','INICIAL','1974-05-22'),
('15','Yadira','grimes.herminia@example.net','INICIAL','1983-10-30'),
('16','Adella','dane.smith@example.net','INICIAL','2012-08-15'),
('17','Stacey','herman.arianna@example.net','INICIAL','2003-11-10'),
('18','Rowland','grussel@example.org','INICIAL','2009-07-01'),
('19','Christina','tjast@example.com','INICIAL','1990-04-23'),
('20','Delpha','titus99@example.com','INICIAL','1974-08-17'),
('21','Cory','oral.schroeder@example.org','INICIAL','2001-11-15'),
('22','Guillermo','geovanni.lang@example.com','INICIAL','2016-11-16'),
('23','Eloise','ashton.muller@example.org','INICIAL','2003-11-06'),
('24','Savanna','miller.neha@example.org','INICIAL','1986-05-07'),
('25','Johnnie','toy.mckayla@example.org','INICIAL','1999-03-18'),
('26','Johnson','strosin.nola@example.org','INICIAL','1991-07-26'),
('27','Jo','kristopher11@example.com','INICIAL','2014-12-12'),
('28','Keven','rory17@example.net','INICIAL','2009-04-26'),
('29','Bertram','arussel@example.org','INICIAL','2000-03-28'),
('30','Hildegard','hettie10@example.com','INICIAL','2011-03-03'),
('31','Glenna','creola.windler@example.net','INICIAL','1985-06-24'),
('32','Pattie','frieda.morissette@example.org','INICIAL','2010-02-11'),
('33','Myah','leannon.grover@example.net','INICIAL','2012-08-09'),
('34','Adrien','oprohaska@example.com','INICIAL','1989-11-23'),
('35','Tatyana','solon.wisoky@example.com','INICIAL','1996-11-21'),
('36','Leif','lind.maybell@example.net','INICIAL','1993-09-26'),
('37','Sheridan','amore.lyric@example.net','INICIAL','1985-01-20'),
('38','Bartholome','heidenreich.donna@example.net','INICIAL','2003-07-23'),
('39','Rogelio','zmurray@example.net','INICIAL','2008-01-19'),
('40','Lilly','olaf76@example.net','INICIAL','2008-09-28'),
('41','Mae','dovie21@example.net','INICIAL','1976-01-14'),
('42','Dwight','leif45@example.org','INICIAL','2013-11-17'),
('43','Demond','tianna12@example.com','INICIAL','1996-06-04'),
('44','Kirsten','stracke.nathanael@example.org','INICIAL','1977-10-31'),
('45','Carmelo','daniel.anibal@example.net','INICIAL','1978-12-12'),
('46','Jany','oconn@example.org','INICIAL','2000-03-30'),
('47','Alford','dean83@example.net','INICIAL','1984-09-03'),
('48','Austyn','ben49@example.org','INICIAL','1980-11-09'),
('49','Paula','tlang@example.net','INICIAL','1990-06-06'),
('50','Tony','maggie42@example.com','INICIAL','2014-08-22'),
('51','Cyrus','roderick.lubowitz@example.com','INICIAL','1981-05-30'),
('52','Heber','reilly03@example.org','INICIAL','1992-04-21'),
('53','Rosalia','jordan00@example.org','INICIAL','2007-09-06'),
('54','Delores','webert@example.net','INICIAL','1999-05-16'),
('55','Keven','kimberly.prohaska@example.net','INICIAL','1988-04-10'),
('56','Savanah','ferne10@example.net','INICIAL','1997-03-14'),
('57','Isom','udubuque@example.com','INICIAL','1974-09-03'),
('58','Regan','aracely73@example.com','INICIAL','2018-04-23'),
('59','Bridgette','emosciski@example.com','INICIAL','1981-06-17'),
('60','Domingo','kshlerin.isaias@example.com','INICIAL','2016-08-02'),
('61','Hayley','considine.jaiden@example.net','INICIAL','1981-01-31'),
('62','Marion','justyn12@example.net','INICIAL','2007-09-26'),
('63','Sylvester','xkutch@example.net','INICIAL','2007-11-28'),
('64','Otha','colt.stamm@example.org','INICIAL','1982-01-30'),
('65','Eladio','zlowe@example.net','INICIAL','1985-11-02'),
('66','Mark','beatty.armando@example.net','INICIAL','2015-11-07'),
('67','Kirk','douglas.viva@example.net','INICIAL','1975-12-18'),
('68','Joshuah','anissa.mcdermott@example.com','INICIAL','2004-06-16'),
('69','Tanya','kreinger@example.org','INICIAL','1979-03-04'),
('70','Nils','noble.hyatt@example.com','INICIAL','1992-03-24'),
('71','Theresia','adela33@example.net','INICIAL','1973-10-01'),
('72','Hillard','cwisoky@example.com','INICIAL','1984-11-01'),
('73','Jaylan','woodrow81@example.com','INICIAL','2010-01-21'),
('74','Sylvia','mclaughlin.haylee@example.com','INICIAL','1971-12-15'),
('75','Nathanial','karine86@example.net','INICIAL','1981-04-04'),
('76','Kailey','tcruickshank@example.net','INICIAL','2006-01-13'),
('77','Sophia','zita.king@example.com','INICIAL','1993-09-29'),
('78','Lavern','uhackett@example.com','INICIAL','1999-01-25'),
('79','Johnson','kolby.heaney@example.com','INICIAL','2002-02-14'),
('80','Yolanda','maggio.scarlett@example.org','INICIAL','2003-05-02'),
('81','Cristal','brody.corwin@example.net','INICIAL','2017-12-04'),
('82','Darlene','tromp.icie@example.org','INICIAL','2000-12-10'),
('83','Clemens','emelia25@example.org','INICIAL','1993-04-27'),
('84','Estevan','torey.franecki@example.org','INICIAL','1986-08-27'),
('85','Jaclyn','will.diamond@example.net','INICIAL','2008-11-10'),
('86','Delaney','xbeatty@example.com','INICIAL','1976-05-03'),
('87','Wilbert','reinger.laurine@example.org','INICIAL','2002-11-27'),
('88','Eldora','bryce00@example.net','INICIAL','1997-03-18'),
('89','Elizabeth','daniel.minerva@example.net','INICIAL','1986-06-04'),
('90','Lupe','berenice.leannon@example.com','INICIAL','2010-12-23'),
('91','Jeremy','boehm.kobe@example.net','INICIAL','1984-02-17'),
('92','Magdalen','mcglynn.randy@example.org','INICIAL','1977-12-22'),
('93','Nathanial','mayer.raymundo@example.com','INICIAL','1976-12-06'),
('94','Marianna','lbreitenberg@example.net','INICIAL','2017-08-17'),
('95','Sister','ana93@example.com','INICIAL','1992-05-15'),
('96','Frances','alehner@example.org','INICIAL','1999-01-01'),
('97','Alta','ritchie.americo@example.org','INICIAL','2016-08-20'),
('98','Joanie','jeffery94@example.org','INICIAL','1976-08-21'),
('99','Gaston','mya67@example.com','INICIAL','1977-08-12'),
('100','Alison','ansley.johnston@example.com','INICIAL','1988-04-10'); 



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

