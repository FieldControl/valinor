-- CreateTable
CREATE TABLE `tb_users` (
    `sr_id` INTEGER NOT NULL AUTO_INCREMENT,
    `vc_name` VARCHAR(191) NOT NULL,
    `vc_email` VARCHAR(191) NOT NULL,
    `vc_password` VARCHAR(191) NOT NULL,
    `dt_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tb_users_vc_email_key`(`vc_email`),
    PRIMARY KEY (`sr_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_boards` (
    `sr_id` INTEGER NOT NULL AUTO_INCREMENT,
    `vc_name` VARCHAR(191) NOT NULL,
    `dt_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`sr_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_users_boards` (
    `sr_id` INTEGER NOT NULL AUTO_INCREMENT,
    `fk_userId` INTEGER NOT NULL,
    `fk_boardId` INTEGER NOT NULL,
    `vc_role` VARCHAR(191) NOT NULL DEFAULT 'member',
    `dt_joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`sr_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_columns` (
    `sr_id` INTEGER NOT NULL AUTO_INCREMENT,
    `vc_name` VARCHAR(191) NOT NULL,
    `it_position` INTEGER NOT NULL,
    `fk_boardId` INTEGER NOT NULL,

    PRIMARY KEY (`sr_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_cards` (
    `sr_id` INTEGER NOT NULL AUTO_INCREMENT,
    `vc_name` VARCHAR(191) NOT NULL,
    `vc_description` VARCHAR(191) NOT NULL,
    `dt_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fk_userId` INTEGER NOT NULL,
    `fk_columnId` INTEGER NOT NULL,

    PRIMARY KEY (`sr_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_users_boards` ADD CONSTRAINT `tb_users_boards_fk_userId_fkey` FOREIGN KEY (`fk_userId`) REFERENCES `tb_users`(`sr_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_users_boards` ADD CONSTRAINT `tb_users_boards_fk_boardId_fkey` FOREIGN KEY (`fk_boardId`) REFERENCES `tb_boards`(`sr_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_columns` ADD CONSTRAINT `tb_columns_fk_boardId_fkey` FOREIGN KEY (`fk_boardId`) REFERENCES `tb_boards`(`sr_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_cards` ADD CONSTRAINT `tb_cards_fk_userId_fkey` FOREIGN KEY (`fk_userId`) REFERENCES `tb_users`(`sr_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_cards` ADD CONSTRAINT `tb_cards_fk_columnId_fkey` FOREIGN KEY (`fk_columnId`) REFERENCES `tb_columns`(`sr_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
