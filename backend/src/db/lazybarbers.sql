-- MySQL dump 10.13  Distrib 8.0.46, for Linux (aarch64)
--
-- Host: localhost    Database: lazybarbers
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `lazybarbers`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `lazybarbers` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `lazybarbers`;

--
-- Table structure for table `__drizzle_migrations`
--

DROP TABLE IF EXISTS `__drizzle_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__drizzle_migrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `hash` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__drizzle_migrations`
--

LOCK TABLES `__drizzle_migrations` WRITE;
/*!40000 ALTER TABLE `__drizzle_migrations` DISABLE KEYS */;
INSERT INTO `__drizzle_migrations` VALUES (1,'5f094ad1e417af11f7176d70ace2fd36d14a77a23097a9733e19a3538da4a94c',1777137643080);
/*!40000 ALTER TABLE `__drizzle_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `audit_logs_created_idx` (`created_at`),
  KEY `audit_logs_user_idx` (`user_id`),
  KEY `audit_logs_action_idx` (`action`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,5,'auth.login','user',5,'{\"email\":\"rubin@lazybarbers.com\"}','2026-05-08 13:11:02'),(2,6,'auth.login','user',6,'{\"email\":\"chakit@lazybarbers.com\"}','2026-05-08 13:11:21'),(3,5,'auth.login','user',5,'{\"email\":\"rubin@lazybarbers.com\"}','2026-05-08 13:11:33'),(4,14,'auth.login','user',14,'{\"email\":\"wantedlag902@gmail.com\"}','2026-05-08 13:11:58'),(5,5,'auth.login','user',5,'{\"email\":\"rubin@lazybarbers.com\"}','2026-05-10 14:09:48'),(6,14,'auth.login','user',14,'{\"email\":\"wantedlag902@gmail.com\"}','2026-05-10 14:10:21'),(7,14,'auth.login','user',14,'{\"email\":\"wantedlag902@gmail.com\"}','2026-05-11 13:29:30'),(8,14,'auth.login','user',14,'{\"email\":\"wantedlag902@gmail.com\"}','2026-05-11 13:38:37'),(9,1,'auth.login','user',1,'{\"email\":\"admin@lazybarbers.com\"}','2026-05-12 01:12:15'),(10,1,'booking.created','booking',10,'{\"reference\":\"LB-2026-0008\",\"service\":\"Classic Haircut\"}','2026-05-12 03:31:20'),(11,1,'booking.created','booking',11,'{\"reference\":\"LB-2026-0009\",\"service\":\"Premium Styling\"}','2026-05-12 03:33:30'),(12,6,'auth.login','user',6,'{\"email\":\"chakit@lazybarbers.com\"}','2026-05-12 15:12:44'),(13,1,'auth.login','user',1,'{\"email\":\"admin@lazybarbers.com\"}','2026-05-13 06:11:14'),(14,14,'auth.login','user',14,'{\"email\":\"wantedlag902@gmail.com\"}','2026-05-13 06:11:51'),(15,14,'auth.login','user',14,'{\"email\":\"wantedlag902@gmail.com\"}','2026-05-13 11:16:15'),(16,1,'auth.login','user',1,'{\"email\":\"admin@lazybarbers.com\"}','2026-05-13 11:37:56'),(17,14,'auth.login','user',14,'{\"email\":\"wantedlag902@gmail.com\"}','2026-05-13 11:40:35'),(18,1,'auth.login','user',1,'{\"email\":\"admin@lazybarbers.com\"}','2026-05-13 11:43:34'),(19,14,'auth.login','user',14,'{\"email\":\"wantedlag902@gmail.com\"}','2026-05-13 12:33:16'),(20,6,'auth.login','user',6,'{\"email\":\"chakit@lazybarbers.com\"}','2026-05-13 12:33:36'),(21,14,'auth.login','user',14,'{\"email\":\"wantedlag902@gmail.com\"}','2026-05-13 13:53:24'),(22,1,'auth.login','user',1,'{\"email\":\"admin@lazybarbers.com\"}','2026-05-13 16:36:39'),(23,16,'booking.created','booking',12,'{\"reference\":\"LB-2026-0010\",\"service\":\"Hair + Beard Combo\"}','2026-05-13 16:55:12'),(24,16,'auth.login','user',16,'{\"email\":\"pokker256@gmail.com\"}','2026-05-14 05:01:16'),(25,16,'booking.created','booking',13,'{\"reference\":\"LB-2026-0011\",\"service\":\"Hair + Beard Combo\"}','2026-05-14 05:02:01'),(26,17,'booking.created','booking',14,'{\"reference\":\"LB-2026-0012\",\"service\":\"Premium Styling\"}','2026-05-14 05:31:25'),(27,1,'auth.login','user',1,'{\"email\":\"admin@lazybarbers.com\"}','2026-05-14 06:23:36'),(28,16,'auth.login','user',16,'{\"email\":\"pokker256@gmail.com\"}','2026-05-14 06:24:17'),(29,16,'booking.created','booking',15,'{\"reference\":\"LB-2026-0013\",\"service\":\"Beard Trim\"}','2026-05-14 06:24:46'),(30,6,'auth.login','user',6,'{\"email\":\"chakit@lazybarbers.com\"}','2026-05-14 06:25:28'),(31,16,'auth.login','user',16,'{\"email\":\"pokker256@gmail.com\"}','2026-05-14 06:25:53'),(32,1,'auth.login','user',1,'{\"email\":\"admin@lazybarbers.com\"}','2026-05-14 12:29:04'),(33,16,'auth.login','user',16,'{\"email\":\"pokker256@gmail.com\"}','2026-05-14 14:00:12'),(34,1,'auth.login','user',1,'{\"email\":\"admin@lazybarbers.com\"}','2026-05-14 14:07:23'),(35,6,'auth.login','user',6,'{\"email\":\"chakit@lazybarbers.com\"}','2026-05-14 14:09:23'),(36,6,'auth.login','user',6,'{\"email\":\"chakit@lazybarbers.com\"}','2026-05-16 14:46:22');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `barber_schedules`
--

DROP TABLE IF EXISTS `barber_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `barber_schedules` (
  `barber_id` int NOT NULL,
  `day_of_week` tinyint NOT NULL,
  `start_time` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `end_time` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_working` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`barber_id`,`day_of_week`),
  CONSTRAINT `fk_barber_schedules_barber_id` FOREIGN KEY (`barber_id`) REFERENCES `barbers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `barber_schedules`
--

LOCK TABLES `barber_schedules` WRITE;
/*!40000 ALTER TABLE `barber_schedules` DISABLE KEYS */;
INSERT INTO `barber_schedules` VALUES (1,0,'09:00','19:00',1),(1,1,'09:00','19:00',1),(1,2,'09:00','19:00',1),(1,3,'09:00','19:00',1),(1,4,'09:00','19:00',1),(1,5,'09:00','19:00',1),(1,6,'09:00','19:00',1),(2,0,'09:00','19:00',1),(2,1,'09:00','19:00',1),(2,2,'09:00','19:00',1),(2,3,'09:00','19:00',1),(2,4,'09:00','19:00',1),(2,5,'09:00','19:00',1),(2,6,'09:00','19:00',1),(3,0,'09:00','19:00',1),(3,1,'09:00','19:00',1),(3,2,'09:00','19:00',1),(3,3,'09:00','19:00',1),(3,4,'09:00','19:00',1),(3,5,'09:00','19:00',1),(3,6,'09:00','19:00',1),(4,0,'09:00','19:00',1),(4,1,'09:00','19:00',1),(4,2,'09:00','19:00',1),(4,3,'09:00','19:00',1),(4,4,'09:00','19:00',1),(4,5,'09:00','19:00',1),(4,6,'09:00','19:00',1),(5,0,'09:00','19:00',1),(5,1,'09:00','19:00',1),(5,2,'09:00','19:00',1),(5,3,'09:00','19:00',1),(5,4,'09:00','19:00',1),(5,5,'09:00','19:00',1),(5,6,'09:00','19:00',1),(6,0,'09:00','19:00',1),(6,1,'09:00','19:00',1),(6,2,'09:00','19:00',1),(6,3,'09:00','19:00',1),(6,4,'09:00','19:00',1),(6,5,'09:00','19:00',1),(6,6,'09:00','19:00',1);
/*!40000 ALTER TABLE `barber_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `barber_time_off`
--

DROP TABLE IF EXISTS `barber_time_off`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `barber_time_off` (
  `id` int NOT NULL AUTO_INCREMENT,
  `barber_id` int NOT NULL,
  `start_date` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `end_date` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','denied') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewed_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `time_off_barber_idx` (`barber_id`,`start_date`,`end_date`),
  KEY `fk_barber_time_off_reviewed_by` (`reviewed_by`),
  CONSTRAINT `fk_barber_time_off_barber_id` FOREIGN KEY (`barber_id`) REFERENCES `barbers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_barber_time_off_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `barber_time_off`
--

LOCK TABLES `barber_time_off` WRITE;
/*!40000 ALTER TABLE `barber_time_off` DISABLE KEYS */;
/*!40000 ALTER TABLE `barber_time_off` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `barbers`
--

DROP TABLE IF EXISTS `barbers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `barbers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `specialty` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` decimal(3,2) NOT NULL DEFAULT '0.00',
  `review_count` int NOT NULL DEFAULT '0',
  `status` enum('active','on_leave','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barbers_user_unique` (`user_id`),
  KEY `barbers_status_idx` (`status`),
  CONSTRAINT `fk_barbers_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `barbers`
--

LOCK TABLES `barbers` WRITE;
/*!40000 ALTER TABLE `barbers` DISABLE KEYS */;
INSERT INTO `barbers` VALUES (1,2,'Senior Barber','Senior barber with 10+ years of experience in classic cuts and modern styles.',NULL,4.90,234,'active',NULL,'2026-04-26 17:59:41','2026-04-26 17:59:41'),(2,3,'Master Barber','Master barber known for premium styling and consultation.',NULL,4.80,189,'active',NULL,'2026-04-26 17:59:41','2026-04-26 17:59:41'),(3,4,'Specialist','Fade & design specialist. Currently on leave — returns Apr 20.',NULL,4.90,156,'on_leave',NULL,'2026-04-26 17:59:41','2026-04-26 17:59:41'),(4,5,'Styling Expert','Custom styling for special occasions and events.',NULL,4.80,142,'active',NULL,'2026-04-26 17:59:41','2026-04-26 17:59:41'),(5,6,'Beard Specialist','Specializes in beard grooming, hot towel shaves, and detail line work.',NULL,4.90,178,'active',NULL,'2026-04-26 17:59:41','2026-04-26 17:59:41'),(6,18,'Classic Cuts','Expert in classic and traditional barbering techniques with attention to detail and clean finishes.',NULL,4.80,165,'active',NULL,'2026-05-16 14:49:27','2026-05-16 14:49:27');
/*!40000 ALTER TABLE `barbers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_counters`
--

DROP TABLE IF EXISTS `booking_counters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_counters` (
  `year` int NOT NULL,
  `value` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_counters`
--

LOCK TABLES `booking_counters` WRITE;
/*!40000 ALTER TABLE `booking_counters` DISABLE KEYS */;
INSERT INTO `booking_counters` VALUES (2026,13);
/*!40000 ALTER TABLE `booking_counters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference` varchar(24) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` int NOT NULL,
  `barber_id` int NOT NULL,
  `service_id` int NOT NULL,
  `start_at` timestamp NOT NULL,
  `end_at` timestamp NOT NULL,
  `status` enum('pending','confirmed','completed','cancelled','no_show') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'confirmed',
  `payment_method` enum('online','counter') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'counter',
  `payment_status` enum('unpaid','paid','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `price_cents` int NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancelled_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bookings_reference_unique` (`reference`),
  KEY `bookings_barber_time_idx` (`barber_id`,`start_at`,`end_at`),
  KEY `bookings_customer_idx` (`customer_id`),
  KEY `bookings_status_idx` (`status`),
  KEY `fk_bookings_service_id` (`service_id`),
  KEY `fk_bookings_cancelled_by` (`cancelled_by`),
  CONSTRAINT `fk_bookings_barber_id` FOREIGN KEY (`barber_id`) REFERENCES `barbers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_cancelled_by` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_service_id` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'LB-2026-0000',14,5,5,'2026-04-28 08:30:00','2026-04-28 08:55:00','confirmed','counter','unpaid',3000,NULL,NULL,NULL,'2026-04-27 16:34:06','2026-04-27 16:34:06'),(2,'LB-2026-0002',14,5,2,'2026-04-28 04:00:00','2026-04-28 04:20:00','completed','online','paid',2500,NULL,NULL,NULL,'2026-04-27 16:34:39','2026-04-28 00:44:40'),(3,'LB-2026-0003',14,2,3,'2026-05-11 03:00:00','2026-05-11 03:50:00','cancelled','online','unpaid',4500,NULL,'2026-05-08 08:27:39',14,'2026-05-08 08:26:12','2026-05-08 08:27:39'),(4,'LB-2026-0004',14,2,3,'2026-05-09 02:30:00','2026-05-09 03:20:00','cancelled','online','unpaid',4500,NULL,'2026-05-08 08:46:26',14,'2026-05-08 08:28:05','2026-05-08 08:46:26'),(5,'LB-2026-0005',14,4,4,'2026-05-14 02:30:00','2026-05-14 03:30:00','cancelled','online','unpaid',5000,NULL,'2026-05-08 08:46:24',14,'2026-05-08 08:37:41','2026-05-08 08:46:24'),(6,'LB-2026-0006',14,4,4,'2026-05-10 03:00:00','2026-05-10 04:00:00','no_show','online','unpaid',5000,NULL,NULL,NULL,'2026-05-08 08:47:12','2026-05-10 14:09:56'),(7,'LB-2026-0007',14,1,2,'2026-05-10 23:30:00','2026-05-10 23:50:00','confirmed','online','paid',2500,NULL,NULL,NULL,'2026-05-08 08:54:03','2026-05-08 08:54:03'),(10,'LB-2026-0008',1,5,1,'2026-05-12 05:00:00','2026-05-12 05:30:00','completed','online','paid',3500,NULL,NULL,NULL,'2026-05-12 03:31:20','2026-05-12 15:12:53'),(11,'LB-2026-0009',1,2,4,'2026-05-12 05:00:00','2026-05-12 06:00:00','confirmed','counter','unpaid',5000,NULL,NULL,NULL,'2026-05-12 03:33:30','2026-05-12 03:33:30'),(12,'LB-2026-0010',16,5,3,'2026-05-14 03:00:00','2026-05-14 03:50:00','completed','online','paid',4500,NULL,NULL,NULL,'2026-05-13 16:55:12','2026-05-14 06:25:34'),(13,'LB-2026-0011',16,1,3,'2026-05-15 03:00:00','2026-05-15 03:50:00','confirmed','online','paid',4500,NULL,NULL,NULL,'2026-05-14 05:02:01','2026-05-14 05:02:01'),(14,'LB-2026-0012',17,1,4,'2026-05-15 04:00:00','2026-05-15 05:00:00','confirmed','online','paid',5000,NULL,NULL,NULL,'2026-05-14 05:31:25','2026-05-14 05:31:25'),(15,'LB-2026-0013',16,5,2,'2026-05-14 07:30:00','2026-05-14 07:50:00','completed','counter','unpaid',2500,NULL,NULL,NULL,'2026-05-14 06:24:46','2026-05-14 06:25:35');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `club_members`
--

DROP TABLE IF EXISTS `club_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `club_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `club_members_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `club_members`
--

LOCK TABLES `club_members` WRITE;
/*!40000 ALTER TABLE `club_members` DISABLE KEYS */;
INSERT INTO `club_members` VALUES (1,'pokker256@gmail.com','Jackson','2026-05-14 06:26:57'),(2,'synstermagar@gmail.com','Jackson Wang','2026-05-14 06:29:33');
/*!40000 ALTER TABLE `club_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
INSERT INTO `contact_messages` VALUES (1,'Shane Mark','synstermagar@gmail.com','0406303470','I would love to work with you guys','I want to work with you guys',1,'2026-05-13 11:37:41');
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `booking_id` int DEFAULT NULL,
  `channel` enum('sms','email') COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'console',
  `status` enum('sent','failed','queued') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sent',
  `error` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notifications_created_idx` (`created_at`),
  KEY `fk_notifications_user_id` (`user_id`),
  KEY `fk_notifications_booking_id` (`booking_id`),
  CONSTRAINT `fk_notifications_booking_id` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_notifications_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,13,NULL,'email','william98@gmail.com','Your Lazy Barbers verification code','Hi John,\n\nWelcome to Lazy Barbers. Please verify your email using this code:\n\n    264475\n\nThe code expires in 10 minutes.\n\nIf you didn\'t sign up, you can safely ignore this email.\n\n— Lazy Barbers','console','sent',NULL,'2026-04-27 13:12:28'),(2,14,NULL,'email','wantedlag902@gmail.com','Your Lazy Barbers verification code','Hi Shane,\n\nWelcome to Lazy Barbers. Please verify your email using this code:\n\n    672566\n\nThe code expires in 10 minutes.\n\nIf you didn\'t sign up, you can safely ignore this email.\n\n— Lazy Barbers','console','sent',NULL,'2026-04-27 15:02:19'),(3,14,1,'sms','0406303470','Booking confirmed','Lazy Barbers: Your booking is confirmed! ✂️\nRef: LB-2026-0000\nTue 28 Apr 2026 at 8:30 am\nService: Kids Haircut\nBarber: Chakit\n15 Good St, Granville NSW\nReply CANCEL to cancel. Questions? Call +61 416 065 592','console','sent',NULL,'2026-04-27 16:34:06'),(4,14,2,'sms','0406303470','Booking confirmed','Lazy Barbers: Your booking is confirmed! ✂️\nRef: LB-2026-0002\nTue 28 Apr 2026 at 4:00 am\nService: Beard Trim\nBarber: Chakit\n15 Good St, Granville NSW\nReply CANCEL to cancel. Questions? Call +61 416 065 592','console','sent',NULL,'2026-04-27 16:34:39'),(5,14,3,'sms','0406303470','Booking confirmed','Lazy Barbers: Your booking is confirmed! ✂️\nRef: LB-2026-0003\nMon 11 May 2026 at 3:00 am\nService: Hair + Beard Combo\nBarber: Pawan\n15 Good St, Granville NSW\nReply CANCEL to cancel. Questions? Call +61 416 065 592','console','sent',NULL,'2026-05-08 08:26:12'),(6,14,3,'sms','0406303470','Booking cancelled','Lazy Barbers: Your booking LB-2026-0003 (Hair + Beard Combo) on Mon 11 May 2026 at 3:00 am has been cancelled. We hope to see you again soon!','console','sent',NULL,'2026-05-08 08:27:39'),(7,14,4,'sms','0406303470','Booking confirmed','Lazy Barbers: Your booking is confirmed! ✂️\nRef: LB-2026-0004\nSat 9 May 2026 at 2:30 am\nService: Hair + Beard Combo\nBarber: Pawan\n15 Good St, Granville NSW\nReply CANCEL to cancel. Questions? Call +61 416 065 592','console','sent',NULL,'2026-05-08 08:28:05'),(8,14,5,'sms','0406303470','Booking confirmed','Lazy Barbers: Your booking is confirmed! ✂️\nRef: LB-2026-0005\nThu 14 May 2026 at 2:30 am\nService: Premium Styling\nBarber: Rubin\n15 Good St, Granville NSW\nReply CANCEL to cancel. Questions? Call +61 416 065 592','console','sent',NULL,'2026-05-08 08:37:41'),(9,14,5,'sms','0406303470','Booking cancelled','Lazy Barbers: Your booking LB-2026-0005 (Premium Styling) on Thu 14 May 2026 at 2:30 am has been cancelled. We hope to see you again soon!','console','sent',NULL,'2026-05-08 08:46:24'),(10,14,4,'sms','0406303470','Booking cancelled','Lazy Barbers: Your booking LB-2026-0004 (Hair + Beard Combo) on Sat 9 May 2026 at 2:30 am has been cancelled. We hope to see you again soon!','console','sent',NULL,'2026-05-08 08:46:26'),(11,14,6,'sms','0406303470','Booking confirmed','Lazy Barbers: Your booking is confirmed! ✂️\nRef: LB-2026-0006\nSun 10 May 2026 at 3:00 am\nService: Premium Styling\nBarber: Rubin\n15 Good St, Granville NSW\nReply CANCEL to cancel. Questions? Call +61 416 065 592','console','sent',NULL,'2026-05-08 08:47:12'),(12,14,7,'sms','0406303470','Booking confirmed','Lazy Barbers: Your booking is confirmed! ✂️\nRef: LB-2026-0007\nSun 10 May 2026 at 11:30 pm\nService: Beard Trim\nBarber: Jase\n15 Good St, Granville NSW\nReply CANCEL to cancel. Questions? Call +61 416 065 592','console','sent',NULL,'2026-05-08 08:54:03'),(13,1,10,'sms','+61 416 065 592','Booking confirmed','Lazy Barbers: Your booking is confirmed! ✂️\nRef: LB-2026-0008\nTue 12 May 2026 at 5:00 am\nService: Classic Haircut\nBarber: Chakit\n15 Good St, Granville NSW\nReply CANCEL to cancel. Questions? Call +61 416 065 592','console','sent',NULL,'2026-05-12 03:31:20'),(14,1,11,'sms','+61 416 065 592','Booking confirmed','Lazy Barbers: Your booking is confirmed! ✂️\nRef: LB-2026-0009\nTue 12 May 2026 at 5:00 am\nService: Premium Styling\nBarber: Pawan\n15 Good St, Granville NSW\nReply CANCEL to cancel. Questions? Call +61 416 065 592','console','sent',NULL,'2026-05-12 03:33:30'),(15,NULL,NULL,'email','admin@lazybarbers.com','New contact: I would love to work with you guys','New contact message from Shane Mark <synstermagar@gmail.com> (0406303470)\n\nSubject: I would love to work with you guys\n\nI want to work with you guys','console','sent',NULL,'2026-05-13 11:37:41'),(16,15,NULL,'email','bina109815@gmail.com','Your Lazy Barbers verification code','Hi Brad,\n\nWelcome to Lazy Barbers. Please verify your email using this code:\n\n    605759\n\nThe code expires in 10 minutes.\n\nIf you didn\'t sign up, you can safely ignore this email.\n\n— Lazy Barbers','console','sent',NULL,'2026-05-13 16:09:25'),(17,1,NULL,'email','test@example.com','Verify your email — Lazy Barbers','Hi John,\n\nYour Lazy Barbers verification code is: 847291\n\nThis code expires in 24 hours.\n\nIf you didn\'t sign up, please ignore this email.','console','sent',NULL,'2026-05-13 16:40:59'),(18,1,NULL,'email','test@example.com','Verify your email — Lazy Barbers','Hi John,\n\nYour Lazy Barbers verification code is: 847291\n\nThis code expires in 24 hours.\n\nIf you didn\'t sign up, please ignore this email.','console','sent',NULL,'2026-05-13 16:43:03'),(19,1,NULL,'email','test@example.com','Verify your email — Lazy Barbers','Hi John,\n\nYour Lazy Barbers verification code is: 847291\n\nThis code expires in 24 hours.\n\nIf you didn\'t sign up, please ignore this email.','console','sent',NULL,'2026-05-13 16:45:07'),(20,16,NULL,'email','pokker256@gmail.com','Verify your email — Lazy Barbers','Hi Jackson,\n\nYour Lazy Barbers verification code is: 940722\n\nThis code expires in 24 hours.\n\nIf you didn\'t sign up, please ignore this email.','console','sent',NULL,'2026-05-13 16:50:34'),(21,16,12,'sms','0420 606 250','Booking confirmed','Lazy Barbers: Your booking is confirmed! ✂️\nRef: LB-2026-0010\nThu 14 May 2026 at 3:00 am\nService: Hair + Beard Combo\nBarber: Chakit\n15 Good St, Granville NSW\nReply CANCEL to cancel. Questions? Call +61 416 065 592','console','sent',NULL,'2026-05-13 16:55:12'),(22,16,13,'sms','0420 606 250','Booking confirmed','Lazy Barbers: Your booking is confirmed! ✂️\nRef: LB-2026-0011\nFri 15 May 2026 at 3:00 am\nService: Hair + Beard Combo\nBarber: Jase\n15 Good St, Granville NSW\nReply CANCEL to cancel. Questions? Call +61 416 065 592','console','sent',NULL,'2026-05-14 05:02:01'),(23,17,14,'sms','0452 425 679','Booking confirmed','Lazy Barbers: Your booking is confirmed! ✂️\nRef: LB-2026-0012\nFri 15 May 2026 at 4:00 am\nService: Premium Styling\nBarber: Jase\n15 Good St, Granville NSW\nReply CANCEL to cancel. Questions? Call +61 416 065 592','console','sent',NULL,'2026-05-14 05:31:25'),(24,16,15,'sms','0420 606 250','Booking confirmed','Lazy Barbers: Your booking is confirmed! ✂️\nRef: LB-2026-0013\nThu 14 May 2026 at 7:30 am\nService: Beard Trim\nBarber: Chakit\n15 Good St, Granville NSW\nReply CANCEL to cancel. Questions? Call +61 416 065 592','console','sent',NULL,'2026-05-14 06:24:46');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `transaction_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount_cents` int NOT NULL,
  `method` enum('online','counter') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('succeeded','failed','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'succeeded',
  `card_last4` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `processed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_tx_unique` (`transaction_id`),
  KEY `payments_booking_idx` (`booking_id`),
  CONSTRAINT `fk_payments_booking_id` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,2,'TXN-007KRNS1',2500,'online','succeeded','4242','2026-04-27 16:34:39'),(2,7,'pi_3TUkAXA3fnVZtJAw03SkGmZo',2500,'online','succeeded',NULL,'2026-05-08 08:54:03'),(3,10,'pi_3TW72QA3fnVZtJAw1AAUNuyu',3500,'online','succeeded',NULL,'2026-05-12 03:31:20'),(4,12,'pi_3TWg3uA3fnVZtJAw0ouFFK51',4500,'online','succeeded',NULL,'2026-05-13 16:55:12'),(5,13,'pi_3TWrPIA3fnVZtJAw0r56DUIg',4500,'online','succeeded',NULL,'2026-05-14 05:02:01'),(6,14,'pi_3TWrrkA3fnVZtJAw1ZgT6s4m',5000,'online','succeeded',NULL,'2026-05-14 05:31:25');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int DEFAULT NULL,
  `booking_id` int DEFAULT NULL,
  `customer_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` tinyint NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_name` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_published` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reviews_published_idx` (`is_published`,`created_at`),
  KEY `fk_reviews_customer_id` (`customer_id`),
  KEY `fk_reviews_booking_id` (`booking_id`),
  CONSTRAINT `fk_reviews_booking_id` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,NULL,NULL,'John Smith',5,'Best haircut I\'ve had in years! The attention to detail is incredible.','Classic Haircut',1,'2026-04-26 17:59:41'),(2,NULL,NULL,'Michael Chen',5,'Professional and friendly service. They took time to understand exactly what I wanted.','Premium Styling',1,'2026-04-26 17:59:41'),(3,NULL,NULL,'David Wilson',5,'Highly recommend Lazy Barbers to anyone looking for quality grooming. Great value for money!','Hair + Beard Combo',1,'2026-04-26 17:59:41'),(4,NULL,NULL,'Sarah Johnson',5,'Amazing experience. The barbers are skilled and the atmosphere is welcoming.','Skin Fade',1,'2026-04-26 17:59:41'),(5,NULL,NULL,'Robert Taylor',4,'Great service and reasonable prices. Only minor wait time during peak hours, but worth it.','Beard Trim',1,'2026-04-26 17:59:41'),(6,NULL,NULL,'Alex Anderson',5,'Been coming here for months now. Consistent quality and friendly staff make this my go-to.','Classic Haircut',1,'2026-04-26 17:59:41'),(7,16,15,'Jackson W.',5,'Awesome Trim. I love it','Beard Trim',1,'2026-05-14 06:26:20');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price_cents` int NOT NULL,
  `duration_minutes` int NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `services_active_idx` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,'Classic Haircut','Timeless cuts that never go out of style. Precision and attention to detail in every snip.','Haircut',3500,30,1,1,'2026-04-26 17:59:41','2026-04-27 07:08:34'),(2,'Beard Trim','Keep your beard looking sharp and well-groomed. Beard shaping and detailed line work.','Beard',2500,20,1,2,'2026-04-26 17:59:41','2026-04-27 07:09:34'),(3,'Hair + Beard Combo','Complete grooming combo — haircut and beard trim together for the full experience.','Combo',4500,50,1,3,'2026-04-26 17:59:41','2026-04-26 17:59:41'),(4,'Premium Styling','Custom styling for special occasions. Includes consultation, premium products, and finishing touches.','Haircut',5000,60,1,4,'2026-04-26 17:59:41','2026-04-26 17:59:41'),(5,'Kids Haircut','Patient, friendly haircuts for kids, designed to be a fun experience.','Haircut',3000,25,1,5,'2026-04-26 17:59:41','2026-04-27 07:07:48'),(6,'Skin Fade','Specialty service featuring expert fade techniques for that perfect gradient.','Haircut',4000,35,1,6,'2026-04-26 17:59:41','2026-04-26 17:59:41');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('customer','barber','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_idx` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','User','admin@lazybarbers.com','+61 416 065 592','$2a$10$dJyk8vVE1KvYy9c1MHw6zutSmiHYLTnyAlIv8ktKrDey1ORUlyij6','admin',1,'2026-04-26 17:59:41','2026-04-26 17:59:41'),(2,'Jase','Macas','jase@lazybarbers.com','+61 400 000 001','$2a$10$t/5c/TLWNhBTSqcq76wW0OL7evpg1XkdBFgUhgYJ4jo32tTKA1m9i','barber',1,'2026-04-26 17:59:41','2026-04-26 17:59:41'),(3,'Pawan','Neupane','pawan@lazybarbers.com','+61 400 000 002','$2a$10$VCoYEb8shOm8tyJYZ9vWRegCN3m.0csIXom.ssV2VM8Z4nPMxtD4C','barber',1,'2026-04-26 17:59:41','2026-04-26 17:59:41'),(4,'Sarun','Magar','sarun@lazybarbers.com','+61 400 000 003','$2a$10$oW3UMnKQWKLg6vkP1CzpguOGwx/3xK7gsos9CY/g2z6Sg1neHAIHy','barber',1,'2026-04-26 17:59:41','2026-04-26 17:59:41'),(5,'Rubin','Bhandari','rubin@lazybarbers.com','+61 400 000 004','$2a$10$nkw8GsSdglOFiwIhGdervOZUB7Jmho62XjSfY7oLprcqsZAYQeIQK','barber',1,'2026-04-26 17:59:41','2026-04-26 17:59:41'),(6,'Chakit','Paudel','chakit@lazybarbers.com','+61 400 000 005','$2a$10$Dd7jaXq2wldIoqijp2bGMeA1sPyFCHYcZzsobgpa2pNF3Ysr4VKCi','barber',1,'2026-04-26 17:59:41','2026-04-26 17:59:41'),(13,'John','William','william98@gmail.com','+61406303470','$2a$10$wmxg2QmJXg13SG8EKNBWseZxrb1Vzq1L0JTQd5.HOUOCNMT/4Li5C','customer',0,'2026-04-27 13:12:28','2026-04-27 13:12:28'),(14,'Shane','Mark','wantedlag902@gmail.com','0406303470','$2a$10$6dvD4C/pKkbCGozs/AoGFOdLiy8.KTxP3cng33bx92YP6ulqU71Uq','customer',1,'2026-04-27 15:02:19','2026-04-27 15:04:09'),(15,'Brad','Pitt','bina109815@gmail.com','0416 251 552','$2a$10$1qAoaoXwF8UkviwhveWgWeERObzu1.CUErOXQ7MBEuG1jJOP1amEe','customer',0,'2026-05-13 16:09:25','2026-05-13 16:09:25'),(16,'Jackson','Wang','pokker256@gmail.com','0420 606 250','$2a$10$Fntq1M78qfr6OpDe8vTtxe2oDKpWXyevMc5/nufMlDRu0LmL2qQi.','customer',1,'2026-05-13 16:50:34','2026-05-13 16:54:18'),(17,'Patrick','Adam','synstermagar@gmail.com','0452 425 679','$2a$10$jvwPjo8jXA/4IjM6rx/DE.eavAxEYyZo/tM9yCjnjYUXFVRusQoJ2','customer',1,'2026-05-14 05:29:57','2026-05-14 05:30:28'),(18,'Sumit','Shrestha','sumit@lazybarbers.com','+61 400 000 006','$2a$10$UeO0TwHsrb9fx0gYOWt1..lIqTUBd2O8yPegLXh/1.44kuz3G3cT6','barber',1,'2026-05-16 14:49:27','2026-05-16 14:49:27');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verification_tokens`
--

DROP TABLE IF EXISTS `verification_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verification_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('email_verify','password_reset') COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vt_user_type_idx` (`user_id`,`type`),
  CONSTRAINT `fk_verification_tokens_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verification_tokens`
--

LOCK TABLES `verification_tokens` WRITE;
/*!40000 ALTER TABLE `verification_tokens` DISABLE KEYS */;
INSERT INTO `verification_tokens` VALUES (1,13,'264475','email_verify','2026-04-27 13:22:28',NULL,'2026-04-27 13:12:28'),(2,14,'672566','email_verify','2026-04-27 15:12:19','2026-04-27 15:04:09','2026-04-27 15:02:19'),(3,15,'605759','email_verify','2026-05-13 16:19:25',NULL,'2026-05-13 16:09:25'),(4,16,'940722','email_verify','2026-05-14 16:50:35','2026-05-13 16:54:18','2026-05-13 16:50:34'),(5,17,'651245','email_verify','2026-05-15 05:29:57','2026-05-14 05:30:28','2026-05-14 05:29:57');
/*!40000 ALTER TABLE `verification_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'lazybarbers'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-16 14:57:39
