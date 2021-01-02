-- Create the database
CREATE DATABASE myminecraft;
USE myminecraft;

-- Create the servers table
CREATE TABLE `servers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `guild` varchar(24) NOT NULL,
  `name` varchar(30) NOT NULL,
  `ip` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);