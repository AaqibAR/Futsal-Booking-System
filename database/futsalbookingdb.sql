-- MySQL dump 10.13  Distrib 8.0.38, for macos14 (arm64)
--
-- Host: localhost    Database: futsal_booking
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `court_id` int DEFAULT NULL,
  `booking_date` date DEFAULT NULL,
  `time_slot` varchar(50) DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','refunded') DEFAULT 'confirmed',
  PRIMARY KEY (`booking_id`),
  KEY `fk_user_booking_cascade` (`user_id`),
  KEY `fk_court_booking_cascade` (`court_id`),
  CONSTRAINT `fk_court_booking_cascade` FOREIGN KEY (`court_id`) REFERENCES `courts` (`court_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_booking_cascade` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (12,12,4,'2026-01-16','8 AM - 9 AM','confirmed'),(13,12,4,'2026-01-17','8 AM - 9 AM','confirmed'),(14,12,4,'2026-01-19','9 AM - 10 AM','cancelled'),(15,12,5,'2026-01-19','8 AM - 9 AM','confirmed'),(16,12,7,'2026-01-20','8 AM - 9 AM','confirmed'),(17,12,6,'2026-01-21','8 AM - 9 AM','cancelled'),(18,12,5,'2026-01-21','8 AM - 9 AM','confirmed'),(19,23,7,'2026-01-22','10 AM - 11 AM','confirmed'),(20,23,6,'2026-01-23','1 PM - 2 PM','confirmed'),(21,12,10,'2026-01-25','8 AM - 9 AM','cancelled'),(22,12,5,'2026-01-30','8 AM - 9 AM','confirmed'),(23,12,7,'2026-01-31','8 AM - 9 AM','confirmed');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courts`
--

DROP TABLE IF EXISTS `courts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courts` (
  `court_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `image_url` text,
  `owner_id` int DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`court_id`),
  KEY `fk_owner_cascade` (`owner_id`),
  CONSTRAINT `fk_owner_cascade` FOREIGN KEY (`owner_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courts`
--

LOCK TABLES `courts` WRITE;
/*!40000 ALTER TABLE `courts` DISABLE KEYS */;
INSERT INTO `courts` VALUES (4,'Colombo City Futsal','Colombo 07',5500.00,'http://localhost:3001/uploads/court-1763910713525.avif',14,NULL),(5,'Kandy Kickoff Hub','Kandy',3000.00,'http://localhost:3001/uploads/court-1763910766709.jpg',14,NULL),(6,'Negombo Night Turf','Negombo',4500.00,'http://localhost:3001/uploads/court-1763910886772.jpg',14,NULL),(7,'Galle Goal Station','Galle Fort',4000.00,'http://localhost:3001/uploads/court-1763910957391.jpg',14,NULL),(10,'Test1','Chilaw',2500.00,'http://LOCALHOST:3001/uploads/file-1769060829743.jpg',24,NULL),(11,'Test 2','Ratnapura',3500.00,'http://LOCALHOST:3001/uploads/file-1769139814620.jpg',24,NULL);
/*!40000 ALTER TABLE `courts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance`
--

DROP TABLE IF EXISTS `maintenance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `court_id` int NOT NULL,
  `date` date NOT NULL,
  `reason` varchar(255) DEFAULT 'Maintenance',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_court_maintenance_cascade` (`court_id`),
  CONSTRAINT `fk_court_maintenance_cascade` FOREIGN KEY (`court_id`) REFERENCES `courts` (`court_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance`
--

LOCK TABLES `maintenance` WRITE;
/*!40000 ALTER TABLE `maintenance` DISABLE KEYS */;
INSERT INTO `maintenance` VALUES (1,10,'2026-01-22','Renovations','2026-01-22 05:47:24'),(2,10,'2026-01-23','Renovations','2026-01-22 05:47:24'),(3,10,'2026-01-24','Renovations','2026-01-22 05:47:24'),(4,10,'2026-01-28','Renovations','2026-01-23 03:44:23'),(5,10,'2026-01-29','Renovations','2026-01-23 03:44:23'),(6,10,'2026-01-30','Renovations','2026-01-23 03:44:23'),(7,10,'2026-01-31','Renovations','2026-01-23 03:44:23');
/*!40000 ALTER TABLE `maintenance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `title` varchar(50) DEFAULT NULL,
  `message` text,
  `type` enum('sms','email','system') DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (31,12,NULL,'Booking #14 Cancelled. Refund LKR 5500.00 initiated.','email',0,'2026-01-17 05:32:47'),(32,12,NULL,'Booking #17 Cancelled. Refund LKR 4500.00 initiated.','email',0,'2026-01-21 16:00:22'),(33,12,NULL,'Booking #21 Cancelled. Refund LKR 2500.00 initiated.','email',0,'2026-01-23 03:41:43');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `method` enum('card','cash','online') DEFAULT 'card',
  `status` enum('paid','unpaid','refunded') DEFAULT 'paid',
  `paid_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `platform_fee` decimal(10,2) DEFAULT '0.00',
  `vendor_net` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`payment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (12,12,5500.00,'card','paid','2026-01-12 14:42:40',0.00,0.00),(13,13,5500.00,'card','paid','2026-01-12 14:43:15',0.00,0.00),(14,14,5500.00,'card','paid','2026-01-17 05:22:50',550.00,4950.00),(15,15,3000.00,'card','paid','2026-01-17 05:26:52',300.00,2700.00),(16,16,4000.00,'card','paid','2026-01-20 05:31:25',800.00,3200.00),(17,17,4500.00,'card','paid','2026-01-21 14:15:46',900.00,3600.00),(18,18,3000.00,'card','paid','2026-01-21 15:57:54',600.00,2400.00),(19,19,4000.00,'card','paid','2026-01-22 05:44:28',800.00,3200.00),(20,20,4500.00,'card','paid','2026-01-23 02:23:30',900.00,3600.00),(21,21,2500.00,'card','paid','2026-01-23 03:40:54',250.00,2250.00),(22,22,3000.00,'card','paid','2026-01-23 04:00:24',600.00,2400.00),(23,23,4000.00,'card','paid','2026-01-30 15:09:28',800.00,3200.00);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refunds`
--

DROP TABLE IF EXISTS `refunds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refunds` (
  `refund_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`refund_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refunds`
--

LOCK TABLES `refunds` WRITE;
/*!40000 ALTER TABLE `refunds` DISABLE KEYS */;
INSERT INTO `refunds` VALUES (9,14,12,5500.00,'approved','2026-01-17 05:32:47'),(10,17,12,4500.00,'approved','2026-01-21 16:00:22'),(11,21,12,2500.00,'approved','2026-01-23 03:41:43');
/*!40000 ALTER TABLE `refunds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `court_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `role` varchar(50) NOT NULL,
  `profile_picture` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `verification_status` varchar(20) DEFAULT 'approved',
  `document_url` varchar(255) DEFAULT NULL,
  `commission_rate` decimal(5,2) DEFAULT '10.00',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (12,'aaqib','$2b$10$KSdg27e4BAjL6zvWx8WStOKRcoVo49DH/O73yNO/aUwaQum/cA7ve','aaqibrasmy24@gmail.com','0761504268','user','http://localhost:3001/uploads/file-1768894436768.png','2026-01-13 11:49:03','approved',NULL,10.00),(14,'partner1','$2b$10$c5bUwPByShYcYeUJSFXC4.PVcZ3W5O.dB7A4JM7fEZb93Ak02t3uK','partner1@gmail.com','0761504268','partner',NULL,'2026-01-13 16:11:05','approved',NULL,20.00),(16,'testp1','$2b$10$OLJwwtRZ/K3fp.PxHXfLQeHaSlV60UlDGd4WpVA/LIyBKjM/1u8Q.','testp1@gmail.com','0761504268','partner',NULL,'2026-01-18 02:51:05','approved',NULL,15.00),(17,'testp2','$2b$10$a5TLwGAI8PJLiyueaz618.VCkL8OS3.o4c8Pj6TQ2JEx3n7PpLtzS','testp2@gmail.com','0761504268','partner',NULL,'2026-01-19 17:05:06','approved','http://localhost:3001/uploads/file-1768842306043.pdf',10.00),(19,'admin','$2b$10$K.CcMpxQYLkyWjsaouL6y.lVjS6nAKa1YO9FoRDbI6wqbsqwYnt9e','admin@futsalpro.com',NULL,'admin',NULL,'2026-01-20 04:47:17','approved',NULL,10.00),(20,'testp3','$2b$10$/bT56CW/ku5kKC1KOuxy8O55d9AcdL1fCwP7nN.uCVI5hGnXgQYea','testp3@gmail.com','0761504268','partner',NULL,'2026-01-20 07:35:19','approved','http://localhost:3001/uploads/file-1768894519143.pdf',10.00),(22,'user1','$2b$10$hVZriiVFFoMM43uBmhC6CejRckVyWfT0XJcTY6ibgVexRqajfwtiC','user1@gmail.com',NULL,'user',NULL,'2026-01-20 09:51:45','approved',NULL,10.00),(23,'user2','$2b$10$2wZz5.D6f/0G4cR7xrEUjeiRMp1nDeciM5jlClMff.M6G13TFmop6','user2@gmail.com',NULL,'user',NULL,'2026-01-22 05:44:02','approved',NULL,10.00),(24,'testp4','$2b$10$H52k7OPM9IlaIlpsOqlNNu5eXvUn7ZjWOdsKxDllQvEIfQ7.ScmVG','testp4@gmail.com','0761504268','partner',NULL,'2026-01-22 05:45:35','approved','http://LOCALHOST:3001/uploads/file-1769060734967.pdf',10.00),(25,'user5','$2b$10$ChFqX68RFSWJobqmcsMW/O4cwfxrp/4AwfdguOzcr/pmINlpEKL5.','user5@gmail.com',NULL,'user',NULL,'2026-01-23 03:45:33','approved',NULL,10.00),(26,'testp5','$2b$10$Xl7DjDPNA6pBycdXMCeOk.D4s3SgPKitalFMsv54N9u/UDmcY9nre','testp5@gmail.com','0761504268','partner',NULL,'2026-01-23 03:47:47','approved','http://LOCALHOST:3001/uploads/file-1769140067036.pdf',10.00);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-30 22:51:37
