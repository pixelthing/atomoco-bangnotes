# ************************************************************
# Sequel Pro SQL dump
# Version 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 0.0.0.0 (MySQL 5.5.9)
# Database: atomoco_notes2
# Generation Time: 2013-12-07 20:05:09 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table bn_accounts
# ------------------------------------------------------------

DROP TABLE IF EXISTS `bn_accounts`;

CREATE TABLE `bn_accounts` (
  `id_accounts` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `a_status` tinyint(1) DEFAULT NULL,
  `a_secret` char(11) DEFAULT NULL,
  PRIMARY KEY (`id_accounts`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

LOCK TABLES `bn_accounts` WRITE;
/*!40000 ALTER TABLE `bn_accounts` DISABLE KEYS */;

INSERT INTO `bn_accounts` (`id_accounts`, `a_status`, `a_secret`)
VALUES
	(1,5,'333333');

/*!40000 ALTER TABLE `bn_accounts` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table bn_actions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `bn_actions`;

CREATE TABLE `bn_actions` (
  `id_actions` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `t_date` datetime DEFAULT NULL,
  `t_who_id` int(11) unsigned DEFAULT '0',
  `t_who_name` varchar(255) DEFAULT NULL,
  `t_page` int(11) unsigned DEFAULT '0',
  `t_note` int(11) unsigned DEFAULT NULL,
  `t_status` tinyint(1) DEFAULT NULL,
  `t_order` int(8) DEFAULT NULL,
  `t_posleft` int(5) DEFAULT NULL,
  `t_postop` int(5) DEFAULT NULL,
  `t_width` int(5) DEFAULT NULL,
  `t_height` int(5) DEFAULT NULL,
  `t_min` tinyint(1) DEFAULT NULL,
  `t_scribble` text,
  PRIMARY KEY (`id_actions`),
  KEY `t_page` (`t_page`),
  KEY `t_date` (`t_date`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



# Dump of table bn_notes
# ------------------------------------------------------------

DROP TABLE IF EXISTS `bn_notes`;

CREATE TABLE `bn_notes` (
  `id_notes` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `n_page` int(11) unsigned NOT NULL DEFAULT '0',
  `n_who_id` int(11) unsigned NOT NULL DEFAULT '0',
  `n_who_name` varchar(255) DEFAULT NULL,
  `n_created` datetime DEFAULT NULL,
  `n_completed` datetime DEFAULT NULL,
  PRIMARY KEY (`id_notes`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



# Dump of table bn_pages
# ------------------------------------------------------------

DROP TABLE IF EXISTS `bn_pages`;

CREATE TABLE `bn_pages` (
  `id_pages` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `p_site` int(11) unsigned DEFAULT NULL,
  `p_ref` varchar(255) DEFAULT NULL,
  `p_datum` varchar(255) DEFAULT NULL,
  `p_minz` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_pages`),
  UNIQUE KEY `p_ref` (`p_ref`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

LOCK TABLES `bn_pages` WRITE;
/*!40000 ALTER TABLE `bn_pages` DISABLE KEYS */;

INSERT INTO `bn_pages` (`id_pages`, `p_site`, `p_ref`, `p_datum`, `p_minz`)
VALUES
	(1,1,'/test1/8/','',4);

/*!40000 ALTER TABLE `bn_pages` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table bn_scribbles
# ------------------------------------------------------------

DROP TABLE IF EXISTS `bn_scribbles`;

CREATE TABLE `bn_scribbles` (
  `id_scribbles` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `s_status` tinyint(1) NOT NULL DEFAULT '0',
  `s_note` int(11) unsigned DEFAULT NULL,
  `s_order` int(11) NOT NULL DEFAULT '500',
  `s_who_name` varchar(255) DEFAULT NULL,
  `s_who_id` int(11) DEFAULT NULL,
  `s_created` datetime DEFAULT NULL,
  `s_message` text,
  PRIMARY KEY (`id_scribbles`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



# Dump of table bn_sites
# ------------------------------------------------------------

DROP TABLE IF EXISTS `bn_sites`;

CREATE TABLE `bn_sites` (
  `id_sites` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `s_status` tinyint(1) DEFAULT NULL,
  `s_secret` char(11) DEFAULT NULL,
  `s_host1_prot` varchar(10) DEFAULT 'http:',
  `s_host1_host` varchar(11) DEFAULT NULL,
  `s_host1_port` char(5) DEFAULT '',
  `s_indexes` varchar(255) DEFAULT NULL,
  `s_datum` varchar(11) DEFAULT NULL,
  `s_account` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id_sites`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

LOCK TABLES `bn_sites` WRITE;
/*!40000 ALTER TABLE `bn_sites` DISABLE KEYS */;

INSERT INTO `bn_sites` (`id_sites`, `s_status`, `s_secret`, `s_host1_prot`, `s_host1_host`, `s_host1_port`, `s_indexes`, `s_datum`, `s_account`)
VALUES
	(1,5,'sd87sadg6','http:','0.0.0.0','','index.php,index.html','container1',1);

/*!40000 ALTER TABLE `bn_sites` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table bn_tokens
# ------------------------------------------------------------

DROP TABLE IF EXISTS `bn_tokens`;

CREATE TABLE `bn_tokens` (
  `id_tokens` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `t_token` varchar(255) DEFAULT NULL,
  `t_status` tinyint(1) DEFAULT NULL,
  `t_account` int(11) unsigned DEFAULT NULL,
  `t_user` int(11) unsigned DEFAULT NULL,
  `t_ip` varchar(255) DEFAULT NULL,
  `t_browser` varchar(255) DEFAULT NULL,
  `t_timeout` datetime DEFAULT NULL,
  PRIMARY KEY (`id_tokens`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



# Dump of table bn_users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `bn_users`;

CREATE TABLE `bn_users` (
  `id_users` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `u_status` tinyint(1) DEFAULT NULL,
  `u_account` int(11) unsigned DEFAULT NULL,
  `u_server` varchar(255) DEFAULT NULL,
  `u_username` varchar(255) DEFAULT NULL,
  `u_password` varchar(255) DEFAULT NULL,
  `u_name_sal` varchar(50) DEFAULT NULL,
  `u_name_first` varchar(255) DEFAULT NULL,
  `u_name_last` varchar(255) DEFAULT NULL,
  `u_colour` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_users`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

LOCK TABLES `bn_users` WRITE;
/*!40000 ALTER TABLE `bn_users` DISABLE KEYS */;

INSERT INTO `bn_users` (`id_users`, `u_status`, `u_account`, `u_server`, `u_username`, `u_password`, `u_name_sal`, `u_name_first`, `u_name_last`, `u_colour`)
VALUES
	(1,5,1,NULL,'craigm','craigm','Mr','Craig','Morey',NULL),
	(2,5,1,NULL,'bob','bob',NULL,'Bob','User','blue1');

/*!40000 ALTER TABLE `bn_users` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
