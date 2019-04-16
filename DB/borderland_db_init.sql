-- MySQL dump 10.13  Distrib 8.0.15, for Win64 (x86_64)
--
-- Host: localhost    Database: borderland_db
-- ------------------------------------------------------
-- Server version	8.0.15

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `gun_types`
--

DROP TABLE IF EXISTS `gun_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `gun_types` (
  `id_gun_types` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type_name` varchar(45) NOT NULL,
  PRIMARY KEY (`id_gun_types`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gun_types`
--

LOCK TABLES `gun_types` WRITE;
/*!40000 ALTER TABLE `gun_types` DISABLE KEYS */;
INSERT INTO `gun_types` VALUES (1,'Repeater Pistol'),(2,'Revolver'),(3,'Submachine Gun'),(4,'Combat Rifle'),(5,'Shotgun'),(6,'Sniper Rifle'),(7,'Rocket Launcher'),(8,'Eridian Gun');
/*!40000 ALTER TABLE `gun_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `gun_view`
--

DROP TABLE IF EXISTS `gun_view`;
/*!50001 DROP VIEW IF EXISTS `gun_view`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `gun_view` AS SELECT 
 1 AS `Gun ID`,
 1 AS `Gun Name`,
 1 AS `Gun Type`,
 1 AS `Gun Description`,
 1 AS `Manufacturer`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `guns`
--

DROP TABLE IF EXISTS `guns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `guns` (
  `id_guns` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `gun_name` varchar(45) NOT NULL,
  `gun_desc` tinytext NOT NULL,
  `id_manufacturer` int(10) unsigned NOT NULL,
  `id_gun_type` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id_guns`),
  KEY `id_manufacturer_idx` (`id_manufacturer`),
  KEY `id_gun_type_idx` (`id_gun_type`),
  CONSTRAINT `id_gun_type` FOREIGN KEY (`id_gun_type`) REFERENCES `gun_types` (`id_gun_types`),
  CONSTRAINT `id_manufacturer` FOREIGN KEY (`id_manufacturer`) REFERENCES `manufacturers` (`id_manufacturer`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guns`
--

LOCK TABLES `guns` WRITE;
/*!40000 ALTER TABLE `guns` DISABLE KEYS */;
INSERT INTO `guns` VALUES (1,'Matchbox','BURN BABY BURN!',5,1);
/*!40000 ALTER TABLE `guns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `manufacturers`
--

DROP TABLE IF EXISTS `manufacturers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `manufacturers` (
  `id_manufacturer` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `manufacturer_name` varchar(45) NOT NULL,
  PRIMARY KEY (`id_manufacturer`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manufacturers`
--

LOCK TABLES `manufacturers` WRITE;
/*!40000 ALTER TABLE `manufacturers` DISABLE KEYS */;
INSERT INTO `manufacturers` VALUES (1,'Atlas'),(2,'Bandit'),(3,'Dahl'),(4,'Eridians'),(5,'Gearbox'),(6,'Hyperion'),(7,'Jakobs'),(8,'Maliwan'),(9,'S&S Munitions'),(10,'Tediore'),(11,'Torgue'),(12,'Vladof');
/*!40000 ALTER TABLE `manufacturers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `gun_view`
--

/*!50001 DROP VIEW IF EXISTS `gun_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `gun_view` AS select `guns`.`id_guns` AS `Gun ID`,`guns`.`gun_name` AS `Gun Name`,`gun_types`.`type_name` AS `Gun Type`,`guns`.`gun_desc` AS `Gun Description`,`manufacturers`.`manufacturer_name` AS `Manufacturer` from ((`guns` join `manufacturers`) join `gun_types`) where ((`guns`.`id_manufacturer` = `manufacturers`.`id_manufacturer`) and (`guns`.`id_gun_type` = `gun_types`.`id_gun_types`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-04-14 20:34:53
