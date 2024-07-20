/*
  Warnings:

  - You are about to alter the column `images` on the `topic` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to drop the `option` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `option` DROP FOREIGN KEY `Option_topicId_fkey`;

-- AlterTable
ALTER TABLE `topic` MODIFY `images` JSON NOT NULL;

-- DropTable
DROP TABLE `option`;

-- CreateTable
CREATE TABLE `TopicOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topicId` INTEGER NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` INTEGER NOT NULL,

    INDEX `TopicOption_topicId_idx`(`topicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TopicOption` ADD CONSTRAINT `TopicOption_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `Topic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Record` ADD CONSTRAINT `Record_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `Topic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
