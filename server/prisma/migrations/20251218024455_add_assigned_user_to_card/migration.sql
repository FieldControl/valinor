-- AlterTable
ALTER TABLE `tb_cards` ADD COLUMN `fk_assignedUserId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `tb_cards` ADD CONSTRAINT `tb_cards_fk_assignedUserId_fkey` FOREIGN KEY (`fk_assignedUserId`) REFERENCES `tb_users`(`sr_id`) ON DELETE SET NULL ON UPDATE CASCADE;
