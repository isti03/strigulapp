CREATE SCHEMA  `striga` DEFAULT CHARACTER SET utf8;
USE `striga`;

DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `names`;
DROP TABLE IF EXISTS `counters`;


CREATE TABLE `sessions` (
    `id`        INT         UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
    `sessionid` VARCHAR(32) NOT NULL UNIQUE,
    `webrtc`    VARCHAR(36) NOT NULL,
    `active`    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `names` (
    `id`        INT         UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
    `name`      TINYTEXT    NOT NULL UNIQUE
);

CREATE TABLE `counters` (
    `id`        INT         UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
    `nameid`    INT         UNSIGNED NOT NULL,
    `noterid`   INT         UNSIGNED NOT NULL,
    `timestamp` TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE `counters` ADD CONSTRAINT `counters_nameid_fk`  FOREIGN KEY (`nameid`)  REFERENCES `names`(`id`);
ALTER TABLE `counters` ADD CONSTRAINT `counters_noterid_fk` FOREIGN KEY (`noterid`) REFERENCES `sessions`(`id`);
